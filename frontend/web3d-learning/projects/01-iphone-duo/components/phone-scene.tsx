'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useEnvironment, useGLTF } from '@react-three/drei';
import { AnimationMixer, Euler, Group, Mesh, MeshStandardMaterial, LoopOnce, MathUtils, Quaternion, Vector3 } from 'three';
import type { AnimationAction, Material } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { poseEase, transitionSeconds, type Pose } from '@/lib/poses';
import { stepDrag } from '@/lib/drag-motion';
import type { DragState } from '@/lib/drag-motion';
import { prepareMaterials } from '@/lib/model-materials';
import { renderConfig } from '@/lib/viewer-config';
import Studio from './studio';
import { useStudioMaps } from './use-studio-maps';

const closedCenter = new Vector3(4.025, -0.012, -0.022);
const halfCenter = new Vector3(3.865, 3.831, -0.022);
const flatCenter = new Vector3(0.022, -0.282, -0.022);

export default function PhoneScene({ pose, onTap, selection, scrub, input, environment }: {
  pose: Pose;
  onTap: () => void;
  selection: number;
  scrub: number | null;
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
        if (material instanceof MeshStandardMaterial && material.envMap && !material.userData.fixedStudio) reflective.add(material);
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
  const scale = (pose.zoom ?? 1) * renderConfig.frameFill * Math.min(viewHeight / pose.bounds[1], viewHeight * aspect / pose.bounds[0]);
  const initialScale = useRef(scale);
  const transition = useRef({ selection: -1, pose, scale, elapsed: transitionSeconds,
    time: pose.time, rotation: new Quaternion(), offset: initialOffset.current.clone(), startScale: scale });
  const scrubCenter = useMemo(() => new Vector3(), []);

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
    if (!preset.current || !offset.current || !modelFrame.current) return;
    const move = transition.current;
    if (move.selection !== selection || move.pose !== pose || move.scale !== scale) {
      move.elapsed = move.selection < 0 ? transitionSeconds : 0;
      const takeDrag = move.selection !== selection && input.current.resetting && turn.current;
      move.selection = selection;
      move.pose = pose;
      move.scale = scale;
      move.time = time.current;
      move.offset.copy(offset.current.position);
      move.rotation.copy(preset.current.quaternion);
      if (takeDrag && turn.current) {
        // 把用户眼前的朝向折入过渡起点，避免拖动复位和姿态过渡同时抢旋转。
        move.rotation.premultiply(turn.current.quaternion);
        input.current.yaw = input.current.targetYaw = 0;
        input.current.pitch = input.current.targetPitch = 0;
        input.current.resetting = false;
      }
      move.startScale = modelFrame.current.scale.x;
    }
    move.elapsed = Math.min(transitionSeconds, move.elapsed + delta);
    const eased = poseEase(move.elapsed / transitionSeconds);
    time.current = scrub === null ? MathUtils.lerp(move.time, pose.time, eased) : 2 * scrub;
    if (scrub === null) offset.current.position.lerpVectors(move.offset, targetOffset, eased);
    else {
      // 以实测的闭合、直角、平展中心插值，手动开合时铰链不会移出画布。
      const centers = [closedCenter, halfCenter, flatCenter];
      const index = scrub < 0.5 ? 0 : 1;
      offset.current.position.copy(scrubCenter.lerpVectors(centers[index], centers[index + 1], 2 * scrub - index)).negate();
    }
    modelFrame.current.scale.setScalar(MathUtils.lerp(move.startScale, scale, eased));
    if (input.current.allowPoseTurn) preset.current.quaternion.slerpQuaternions(move.rotation, targetRotation, eased);
    if (player.current) {
      player.current.action.time = time.current;
      player.current.mixer.update(0);
    }
    stepDrag(input.current, delta);
    if (turn.current) turn.current.rotation.set(input.current.pitch, input.current.yaw, 0);
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
            <primitive object={model} dispose={null} onClick={(event: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              if (event.delta <= 4) onTap();
            }} />
          </group>
        </group>
      </group>
    </group>
  </>;
}
