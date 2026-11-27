'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useEnvironment, useGLTF } from '@react-three/drei';
import { AnimationMixer, Euler, Group, Mesh, MeshStandardMaterial, LoopOnce, MathUtils, Quaternion, Vector3 } from 'three';
import type { AnimationAction, Material } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Pose } from '@/lib/poses';
import { stepDrag } from '@/lib/drag-motion';
import type { DragState } from '@/lib/drag-motion';
import { prepareMaterials } from '@/lib/model-materials';
import { motionConfig, renderConfig } from '@/lib/viewer-config';
import Studio from './studio';
import { useStudioMaps } from './use-studio-maps';

export default function PhoneScene({ pose, input, environment }: {
  pose: Pose;
  input: RefObject<DragState>;
  environment: boolean;
}) {
  const gltf = useGLTF('/models/iphone-duo/phone.gltf');
  const lens = useEnvironment({ files: '/models/iphone-duo/lens-reflections.exr' });
  const surface = useEnvironment({ files: '/models/iphone-duo/surface-reflections.exr' });
  const { maps: studioMaps, update: updateStudio } = useStudioMaps();
  const reflectiveMaterials = useRef<MeshStandardMaterial[]>([]);
  const lightingRotation = useMemo(() => new Quaternion(), []);
  const productRotation = useMemo(() => new Quaternion(), []);
  const viewDirection = useMemo(() => new Vector3(), []);
  const yAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const model = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const sourceMaterials = useMemo(() => {
    const originals = new Map<Mesh, Material | Material[]>();
    model.traverse(object => { if (object instanceof Mesh) originals.set(object, object.material); });
    return originals;
  }, [model]);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    // 每次 effect 都从源材质开始，保证 Strict Mode 的建立与清理可重复。
    for (const [mesh, material] of sourceMaterials) mesh.material = material;
    const dispose = prepareMaterials(model, gl.capabilities.getMaxAnisotropy(), environment && studioMaps ? { ...studioMaps, lens, surface } : null);
    const reflective = new Set<MeshStandardMaterial>();
    model.traverse(object => {
      if (!(object instanceof Mesh)) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof MeshStandardMaterial && material.envMap) reflective.add(material);
      }
    });
    reflectiveMaterials.current = [...reflective];
    return () => {
      reflectiveMaterials.current = [];
      for (const [mesh, material] of sourceMaterials) mesh.material = material;
      dispose();
    };
  }, [model, sourceMaterials, gl, lens, surface, environment, studioMaps]);
  const clip = gltf.animations.find(animation => animation.name === 'Slider');
  if (!clip) throw new Error('The expected Slider clip is missing');
  const player = useRef<{ mixer: AnimationMixer; action: AnimationAction } | null>(null);
  const turn = useRef<Group>(null);
  const preset = useRef<Group>(null);
  const offset = useRef<Group>(null);
  const modelFrame = useRef<Group>(null);
  const time = useRef(pose.time);
  const targetRotation = useMemo(() => new Quaternion().setFromEuler(new Euler(...pose.rotation)), [pose]);
  const targetOffset = useMemo(() => new Vector3(...pose.center).negate(), [pose]);
  const initialOffset = useRef(targetOffset.clone());
  const aspect = useThree(state => state.size.width / state.size.height);
  const viewHeight = 2 * renderConfig.cameraPosition[2] * Math.tan(MathUtils.degToRad(renderConfig.fov / 2));
  const scale = renderConfig.frameFill * Math.min(viewHeight / pose.bounds[1], viewHeight * aspect / pose.bounds[0]);
  const initialScale = useRef(scale);
  const newScale = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    const action = mixer.clipAction(clip);
    action.reset().setLoop(LoopOnce, 1).play();
    action.clampWhenFinished = true;
    action.paused = true;
    player.current = { mixer, action };
    return () => {
      player.current = null;
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    };
  }, [clip, model]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const alpha = 1 - Math.exp(-motionConfig.poseRate * dt);
    time.current = MathUtils.damp(time.current, pose.time, motionConfig.poseRate, dt);
    if (player.current) {
      player.current.action.time = time.current;
      player.current.mixer.update(0);
    }
    if (offset.current) offset.current.position.lerp(targetOffset, alpha);
    if (modelFrame.current) modelFrame.current.scale.lerp(newScale.setScalar(scale), alpha);
    stepDrag(input.current, delta);
    if (turn.current) turn.current.rotation.set(input.current.pitch, input.current.yaw, 0);
    // Dragging interrupts the automatic turn; another pose/reset resumes it.
    if (preset.current && input.current.allowPoseTurn) preset.current.quaternion.slerp(targetRotation, alpha);
    if (environment && turn.current && preset.current) {
      productRotation.copy(turn.current.quaternion).multiply(preset.current.quaternion);
      viewDirection.set(0, 0, 1).applyQuaternion(lightingRotation.copy(productRotation).invert());
      updateStudio.current(Math.atan2(-viewDirection.x, viewDirection.z), MathUtils.clamp(time.current / 2, 0, 1), state.clock.elapsedTime);
      for (const material of reflectiveMaterials.current) {
        lightingRotation.setFromAxisAngle(yAxis, material.userData.environmentRotation ?? Math.PI).premultiply(productRotation);
        material.envMapRotation.setFromQuaternion(lightingRotation);
      }
    }
  });

  return <>
    <Studio />
    <group ref={turn}>
      <group ref={preset}>
        <group ref={modelFrame} rotation={[Math.PI / 2, 0, 0]} scale={initialScale.current}>
          <group ref={offset} position={initialOffset.current}>
            <primitive object={model} dispose={null} />
          </group>
        </group>
      </group>
    </group>
  </>;
}
