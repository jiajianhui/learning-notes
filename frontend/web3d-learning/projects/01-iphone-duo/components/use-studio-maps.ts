'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, CubeCamera, HalfFloatType, PMREMGenerator, Scene, WebGLCubeRenderTarget } from 'three';
import type { Texture } from 'three';
import { createStudioLighting } from '@/lib/studio-lighting';
import { studioConfig } from '@/lib/viewer-config';

export type StudioMaps = { body: Texture; details: Texture; metal: Texture };

export function useStudioMaps() {
  const body = useGLTF('/models/iphone-duo/studio/body.gltf');
  const details = useGLTF('/models/iphone-duo/studio/details.gltf');
  const metal = useGLTF('/models/iphone-duo/studio/metal.gltf');
  const gl = useThree(state => state.gl);
  const [maps, setMaps] = useState<StudioMaps | null>(null);
  const update = useRef<(yaw: number, open: number, elapsed: number) => void>(() => {});

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const captures = [body.scene, details.scene, metal.scene].map(source => {
      const studio = createStudioLighting(source);
      const scene = new Scene();
      scene.background = new Color('black');
      scene.add(studio.model);
      const cube = new WebGLCubeRenderTarget(studioConfig.resolution, { type: HalfFloatType });
      const camera = new CubeCamera(0.1, 2000, cube);
      studio.update(0, 0);
      camera.update(gl, scene);
      const target = generator.fromCubemap(cube.texture);
      return { studio, scene, camera, cube, target };
    });
    setMaps({ body: captures[0].target.texture, details: captures[1].target.texture, metal: captures[2].target.texture });
    let lastAt = -Infinity, lastYaw = 0, lastOpen = 0;
    update.current = (yaw, open, elapsed) => {
      const angleDelta = Math.atan2(Math.sin(yaw - lastYaw), Math.cos(yaw - lastYaw));
      if (Math.abs(angleDelta) < 0.002 && Math.abs(open - lastOpen) < 0.002) return;
      if (elapsed - lastAt < 1 / studioConfig.updatesPerSecond) return;
      for (const { studio, scene, camera, cube, target } of captures) {
        studio.update(yaw, open);
        camera.update(gl, scene);
        generator.fromCubemap(cube.texture, target);
      }
      lastYaw = yaw; lastOpen = open; lastAt = elapsed;
    };
    return () => {
      update.current = () => {};
      for (const { studio, cube, target } of captures) { studio.dispose(); cube.dispose(); target.dispose(); }
      generator.dispose();
    };
  }, [body.scene, details.scene, metal.scene, gl]);

  return { maps, update };
}
