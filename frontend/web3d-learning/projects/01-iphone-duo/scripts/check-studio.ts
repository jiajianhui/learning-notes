import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { createStudioLighting, lightingBlend } from '../lib/studio-lighting';

assert.equal(lightingBlend(0).from, 'front');
assert.equal(lightingBlend(Math.PI).from, 'back');
assert.equal(lightingBlend(3 * Math.PI - 4.716).from, 'left');
assert.deepEqual(lightingBlend(0), lightingBlend(2 * Math.PI));
const geometry = new PlaneGeometry();
const material = new MeshStandardMaterial({ name: 'card', emissive: 'white' });
const source = new Group();
const mesh = new Mesh(geometry, material); mesh.name = 'panel'; source.add(mesh);
const names = ['front', 'frontRight', 'right', 'backRight', 'back', 'backLeft', 'left', 'frontLeft'];
source.userData.lightingStates = Object.fromEntries(names.flatMap((name, i) => [
  [name, { panel: { positionX: i }, card: { emissiveIntensity: i + 1, opacity: 1 } }],
  [name + '_Open', { panel: { positionX: i + 10 }, card: { emissiveIntensity: i + 11, opacity: 0 } }],
]));
const studio = createStudioLighting(source);
studio.update(Math.PI / 8, 0.5);
const result = studio.model.getObjectByName('panel') as Mesh<PlaneGeometry, MeshStandardMaterial>;
assert.equal(result.position.x, 5.5);
assert.equal(result.material.emissiveIntensity, 6.5);
assert.equal(result.material.opacity, 0.5);
assert.equal(mesh.position.x, 0); // 不改 useGLTF 共享缓存。
assert.equal(material.emissiveIntensity, 1);
studio.update(-1e-7, 0); const before = result.position.x;
studio.update(1e-7, 0); assert.ok(Math.abs(result.position.x - before) < 1e-5);
studio.dispose(); material.dispose(); geometry.dispose();

const root = resolve('public/models/iphone-duo');
let dependencies = 0;
for (const relative of ['phone.gltf', 'studio/body.gltf', 'studio/details.gltf', 'studio/metal.gltf']) {
  const file = resolve(root, relative), doc = JSON.parse(readFileSync(file, 'utf8'));
  for (const buffer of doc.buffers) { assert.equal(statSync(resolve(dirname(file), buffer.uri)).size, buffer.byteLength); dependencies++; }
  for (const image of doc.images ?? []) { assert.ok(statSync(resolve(dirname(file), image.uri)).size > 0); dependencies++; }
  if (relative.startsWith('studio/')) {
    const states = doc.scenes[0].extras.lightingStates;
    for (const name of names) { assert.ok(states[name]); assert.ok(states[name + '_Open']); }
    for (const state of Object.values(states) as Record<string, Record<string, number>>[]) {
      for (const values of Object.values(state)) for (const value of Object.values(values)) assert.ok(Number.isFinite(value));
    }
  }
}
console.log(`Passed: lighting anchors, wrap continuity, open interpolation, shared-cache isolation; ${dependencies} asset dependencies.`);
