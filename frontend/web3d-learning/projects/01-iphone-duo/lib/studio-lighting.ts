import { Euler, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import type { Group, Object3D } from 'three';

type States = Record<string, Record<string, Record<string, number>>>;
const views = ['front', 'frontRight', 'right', 'backRight', 'back', 'backLeft', 'left', 'frontLeft'];
export function lightingBlend(yaw: number) {
  const step = ((yaw / (Math.PI / 4)) % 8 + 8) % 8;
  const index = Math.floor(step);
  return { from: views[index], to: views[(index + 1) % 8], weight: step - index };
}

// 读取资产附带的视角布光。节点名只在资产里，代码解释通用变换和发光参数。
export function createStudioLighting(source: Group) {
  const model = source.clone(true);
  const states = source.userData.lightingStates as States;
  if (!states?.front || !states?.back) throw new Error('Studio lighting states are missing');
  const owned = new Map<MeshStandardMaterial, MeshStandardMaterial>();
  model.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const copy = (original: MeshStandardMaterial) => {
      if (!owned.has(original)) {
        const material = original.clone();
        material.transparent ||= Object.values(states).some(state => (state[original.name]?.opacity ?? 1) < 1);
        material.depthWrite = !material.transparent;
        material.toneMapped = false;
        owned.set(original, material);
      }
      return owned.get(original)!;
    };
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
  });
  type Pose = { position: Vector3; scale: Vector3; rotation: Quaternion };
  const nodes: Array<{ object: Object3D; poses: Record<string, Pose> }> = [];
  model.traverse(object => {
    if (!Object.values(states).some(state => state[object.name])) return;
    const euler = new Euler().setFromQuaternion(object.quaternion);
    const poses = Object.fromEntries(Object.entries(states).map(([key, state]) => {
      const v = state[object.name] ?? {};
      return [key, {
        position: new Vector3(v.positionX ?? object.position.x, v.positionY ?? object.position.y, v.positionZ ?? object.position.z),
        scale: new Vector3(v.scaleX ?? object.scale.x, v.scaleY ?? object.scale.y, v.scaleZ ?? object.scale.z),
        rotation: new Quaternion().setFromEuler(new Euler(v.rotationX ?? euler.x, v.rotationY ?? euler.y, v.rotationZ ?? euler.z)),
      }];
    }));
    nodes.push({ object, poses });
  });
  const materials = [...owned.values()].map(material => ({ material, base: {
    emissiveR: material.emissive.r, emissiveG: material.emissive.g, emissiveB: material.emissive.b,
    emissiveIntensity: material.emissiveIntensity, opacity: material.opacity,
    colorR: material.color.r, colorG: material.color.g, colorB: material.color.b,
  } }));
  const position = new Vector3(), scale = new Vector3(), rotation = new Quaternion();
  return {
    model,
    update(yaw: number, open: number) {
      const { from, to, weight } = lightingBlend(yaw);
      const opened = (name: string) => states[`${name}_Open`] ? `${name}_Open` : name;
      for (const { object, poses } of nodes) {
        const a = poses[from], b = poses[to], c = poses[opened(from)], d = poses[opened(to)];
        object.position.copy(a.position).lerp(b.position, weight).lerp(position.copy(c.position).lerp(d.position, weight), open);
        object.scale.copy(a.scale).lerp(b.scale, weight).lerp(scale.copy(c.scale).lerp(d.scale, weight), open);
        object.quaternion.copy(a.rotation).slerp(b.rotation, weight).slerp(rotation.copy(c.rotation).slerp(d.rotation, weight), open);
      }
      for (const { material, base } of materials) {
        const value = (key: keyof typeof base) => {
          const sample = (state: string) => states[state]?.[material.name]?.[key] ?? base[key];
          const closed = sample(from) * (1 - weight) + sample(to) * weight;
          const expanded = sample(opened(from)) * (1 - weight) + sample(opened(to)) * weight;
          return closed * (1 - open) + expanded * open;
        };
        material.emissive.setRGB(value('emissiveR'), value('emissiveG'), value('emissiveB'));
        material.emissiveIntensity = value('emissiveIntensity');
        material.opacity = value('opacity');
        material.color.setRGB(value('colorR'), value('colorG'), value('colorB'));
      }
    },
    dispose() { for (const material of owned.values()) material.dispose(); },
  };
}
