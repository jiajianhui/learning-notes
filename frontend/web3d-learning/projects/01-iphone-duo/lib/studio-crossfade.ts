import { NoBlending, ShaderMaterial } from 'three';
import type { WebGLRenderer, WebGLRenderTarget } from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { lightingBlend } from './studio-lighting';

// PMREM 已把粗糙度层排进同一张线性 HDR 图。相同像素直接混合即可保留各层高光。
export function createStudioCrossfade(gl: WebGLRenderer,
  capture: (yaw: number, open: number) => WebGLRenderTarget) {
  const first = capture(0, 0);
  const cache = new Map<string, WebGLRenderTarget>([['front:0', first]]);
  const output = first.clone();
  const uniforms = {
    a: { value: first.texture }, b: { value: first.texture },
    c: { value: first.texture }, d: { value: first.texture },
    angle: { value: 0 }, fold: { value: 0 },
  };
  const material = new ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, blending: NoBlending, toneMapped: false,
    vertexShader: 'varying vec2 coord; void main(){ coord=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: `
      varying vec2 coord;
      uniform sampler2D a, b, c, d;
      uniform float angle, fold;
      void main() {
        vec4 closed = mix(texture2D(a, coord), texture2D(b, coord), angle);
        vec4 opened = mix(texture2D(c, coord), texture2D(d, coord), angle);
        gl_FragColor = mix(closed, opened, fold);
      }`,
  });
  const quad = new FullScreenQuad(material);
  function endpoint(name: string, yaw: number, open: number) {
    const key = name + ':' + open;
    const entry = cache.get(key) ?? capture(yaw, open);
    cache.delete(key);
    cache.set(key, entry);
    return entry.texture;
  }
  function update(yaw: number, open: number) {
    const view = lightingBlend(yaw);
    // 展开或闭合的端点只需一组贴图，避免为零权重的状态重拍灯棚。
    const lower = open === 1 ? 1 : 0;
    uniforms.a.value = endpoint(view.from, view.fromYaw, lower);
    uniforms.b.value = view.weight ? endpoint(view.to, view.toYaw, lower) : uniforms.a.value;
    uniforms.c.value = open > 0 && open < 1 ? endpoint(view.from, view.fromYaw, 1) : uniforms.a.value;
    uniforms.d.value = open > 0 && open < 1 && view.weight ? endpoint(view.to, view.toYaw, 1)
      : view.weight ? uniforms.b.value : uniforms.c.value;
    uniforms.angle.value = view.weight;
    uniforms.fold.value = open;
    const previous = gl.getRenderTarget(), face = gl.getActiveCubeFace(), mip = gl.getActiveMipmapLevel();
    try {
      gl.setRenderTarget(output);
      quad.render(gl);
    } finally {
      gl.setRenderTarget(previous, face, mip);
    }
    while (cache.size > 4) {
      const oldest = cache.keys().next().value!;
      cache.get(oldest)!.dispose();
      cache.delete(oldest);
    }
  }
  update(0, 0);
  return { texture: output.texture, update, dispose() {
    for (const target of cache.values()) target.dispose();
    output.dispose();
    material.dispose();
    quad.dispose();
  } };
}
