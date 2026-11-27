'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Color, CubeCamera, HalfFloatType, PMREMGenerator, Scene, WebGLCubeRenderTarget } from 'three';
import type { Texture, WebGLRenderTarget } from 'three';
import { createStudioLighting } from '@/lib/studio-lighting';
import { createStudioCrossfade } from '@/lib/studio-crossfade';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { studioConfig } from '@/lib/viewer-config';

export type StudioMaps = { body: Texture; details: Texture; metal: Texture };

export function useStudioMaps() {
  const body = useGLTF('/models/iphone-duo/studio/body.gltf');
  const details = useGLTF('/models/iphone-duo/studio/details.gltf');
  const gl = useThree(state => state.gl);
  const [maps, setMaps] = useState<StudioMaps | null>(null);
  const update = useRef<(yaw: number, open: number, elapsed: number) => void>(() => {});

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const roomMap = generator.fromScene(room, 0.04);
    room.dispose();
    const captures = [body.scene, details.scene].map(source => {
      const studio = createStudioLighting(source);
      const scene = new Scene();
      scene.background = new Color('black');
      scene.add(studio.model);
      const cube = new WebGLCubeRenderTarget(studioConfig.resolution, { type: HalfFloatType });
      const camera = new CubeCamera(0.1, 2000, cube);
      function capture(yaw: number, open: number, target?: WebGLRenderTarget) {
        studio.update(yaw, open);
        camera.update(gl, scene);
        return generator.fromCubemap(cube.texture, target);
      }
      const lighting = createStudioCrossfade(gl, capture);
      return { studio, cube, lighting };
    });
    setMaps({ body: captures[0].lighting.texture, details: captures[1].lighting.texture, metal: roomMap.texture });
    let lastAt = -Infinity, lastYaw = 0, lastOpen = 0;
    update.current = (yaw, open, elapsed) => {
      const angleDelta = Math.atan2(Math.sin(yaw - lastYaw), Math.cos(yaw - lastYaw));
      if (Math.abs(angleDelta) < 0.002 && Math.abs(open - lastOpen) < 0.002) return;
      if (elapsed - lastAt < 1 / studioConfig.updatesPerSecond) return;
      for (const { lighting } of captures) lighting.update(yaw, open);
      lastYaw = yaw; lastOpen = open; lastAt = elapsed;
    };
    return () => {
      update.current = () => {};
      for (const { studio, cube, lighting } of captures) { studio.dispose(); cube.dispose(); lighting.dispose(); }
      roomMap.dispose();
      generator.dispose();
    };
  }, [body.scene, details.scene, gl]);

  return { maps, update };
}
