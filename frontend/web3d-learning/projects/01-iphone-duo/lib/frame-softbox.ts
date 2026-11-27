import type { MeshStandardMaterial } from 'three';

// 产品棚中随相机取景的宽柔光。只补外框金属的间接镜面光，在色调映射前参与 HDR 合成。
export function applyFrameSoftbox(material: MeshStandardMaterial) {
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      vec3 reflectedView = reflect(-normalize(vViewPosition), normal);
      float elevation = abs(reflectedView.y);
      float darkBand = smoothstep(0.03, 0.24, abs(elevation - 0.73));
      float panel = smoothstep(-0.10, 0.55, reflectedView.z);
      float rim = 1.0 - smoothstep(-1.0, -0.85, reflectedView.z);
      float fill = darkBand * (0.44 * panel + 0.19 * rim);
      outgoingLight += fill * material.specularColor;
      #include <opaque_fragment>
    `);
  };
}
