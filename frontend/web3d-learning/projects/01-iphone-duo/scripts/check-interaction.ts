import assert from 'node:assert/strict';
import { createDragState, beginDrag, moveDrag, endDrag, stepDrag, resetDrag } from '../lib/drag-motion';
import { motionConfig } from '../lib/viewer-config';

const tilt = createDragState();
beginDrag(tilt, 1, 0, 0, 0);
moveDrag(tilt, 0, 10000, 800, 500, 16, false);
for (let i = 0; i < 120; i++) stepDrag(tilt, 1 / 60);
assert.ok(tilt.pitch <= motionConfig.pitchLimit);
moveDrag(tilt, 0, 9990, 800, 500, 32, false);
assert.ok(tilt.targetPitch < motionConfig.pitchLimit, 'reversal responds immediately at the limit');
endDrag(tilt, 33, false);
for (let i = 0; i < 120; i++) stepDrag(tilt, 1 / 60);
assert.equal(tilt.pitch, 0, 'vertical drag returns to level after release');

function coast(fps: number) {
  const state = createDragState();
  state.velocityYaw = 3;
  for (let i = 0; i < fps; i++) stepDrag(state, 1 / fps);
  return state;
}
const samples = [30, 60, 120].map(coast);
assert.ok(Math.max(...samples.map(s => s.yaw)) - Math.min(...samples.map(s => s.yaw)) < 0.001);
assert.ok(samples[1].yaw > 0 && samples[1].yaw < .8);
assert.ok(samples[1].velocityYaw < .05, 'coasting comes to rest');

const stopped = createDragState();
beginDrag(stopped, 1, 0, 0, 0);
moveDrag(stopped, 100, 0, 800, 500, 16, false);
endDrag(stopped, 200, false);
assert.equal(stopped.velocityYaw, 0, 'holding still before release does not fling');
stopped.velocityYaw = 3;
endDrag(stopped, 201, true);
assert.equal(stopped.velocityYaw, 0, 'cancel stops momentum');

const reset = createDragState();
reset.yaw = Math.PI * 8 + .3;
reset.pitch = .1;
resetDrag(reset);
assert.ok(Math.abs(reset.targetYaw - reset.yaw) < Math.PI, 'reset takes the nearest full turn');
stepDrag(reset, 1 / 60);
const before = reset.yaw;
beginDrag(reset, 2, 20, 20, 300);
assert.equal(reset.targetYaw, before, 'grab during reset starts from the displayed angle');
assert.equal(reset.resetting, false);

// A real input sequence must continue moving after release, then settle on an anchor.
for (const fps of [30, 60, 120]) {
  const s = createDragState();
  beginDrag(s, 1, 0, 0, 0);
  for (let t = 16; t <= 160; t += 16) {
    moveDrag(s, t * 1.5, 40, 800, 500, t, false);
    stepDrag(s, .016);
  }
  const released = s.yaw;
  const velocity = s.velocityYaw;
  moveDrag(s, 240, 40, 800, 500, 165, false);
  assert.equal(s.velocityYaw, velocity, 'zero-distance event preserves release velocity');
  endDrag(s, 170, false);
  stepDrag(s, 1 / fps);
  assert.ok(s.yaw > released, 'release preserves visible momentum');
  for (let i = 0; i < fps * 3; i++) stepDrag(s, 1 / fps);
  assert.equal(s.pitch, 0);
  assert.ok(Math.abs(s.yaw / motionConfig.snapStep - Math.round(s.yaw / motionConfig.snapStep)) < .0001, 'settles at a 45 degree anchor');
}

const snap = createDragState();
snap.yaw = snap.targetYaw = Math.PI - .1;
endDrag(snap, 200, false);
for (let i = 0; i < 120; i++) stepDrag(snap, 1 / 60);
assert.equal(snap.yaw, Math.PI, 'near rear face snaps to rear face');
beginDrag(snap, 2, 0, 0, 201);
moveDrag(snap, 20, 0, 800, 500, 217, false);
assert.ok(snap.targetYaw > Math.PI, 'drag immediately releases the anchor');
assert.equal(snap.snapTarget, null);

console.log('Passed: tilt return/limit/reversal, release/cancel, inertia and snapping at 30/60/120 Hz, zero-motion events, reset interruption.');
