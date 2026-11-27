import { motionConfig as config } from './viewer-config';

import { nearestView } from './reference-views';

export type DragState = {
  pointerId: number | null;
  x: number;
  y: number;
  lastMoveAt: number;
  targetYaw: number;
  targetPitch: number;
  yaw: number;
  pitch: number;
  velocityYaw: number;
  velocityPitch: number;
  snapTarget: number | null;
  snapping: boolean;
  resetting: boolean;
  allowPoseTurn: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const follow = (value: number, target: number, rate: number, dt: number) =>
  target + (value - target) * Math.exp(-rate * dt);

// 临界阻尼弹簧的解析解：按真实秒数更新，不依赖屏幕刷新率。
function spring(value: number, velocity: number, target: number, rate: number, dt: number) {
  const offset = value - target;
  const c = velocity + rate * offset;
  const decay = Math.exp(-rate * dt);
  return [target + (offset + c * dt) * decay, (velocity - rate * c * dt) * decay];
}

export function createDragState(): DragState {
  return { pointerId: null, x: 0, y: 0, lastMoveAt: 0,
    targetYaw: 0, targetPitch: 0, yaw: 0, pitch: 0,
    velocityYaw: 0, velocityPitch: 0, snapTarget: null, snapping: false,
    resetting: false, allowPoseTurn: true };
}

export function beginDrag(state: DragState, id: number, x: number, y: number, now: number) {
  Object.assign(state, { pointerId: id, x, y, lastMoveAt: now,
    targetYaw: state.yaw, targetPitch: state.pitch, snapTarget: null, snapping: false,
    velocityYaw: 0, velocityPitch: 0, resetting: false, allowPoseTurn: false });
}

export function moveDrag(state: DragState, x: number, y: number, width: number, height: number, now: number, touch: boolean) {
  if (width <= 0 || height <= 0 || (x === state.x && y === state.y)) return;
  const dt = Math.max((now - state.lastMoveAt) / 1000, 0.001);
  const dyaw = (x - state.x) / width * config.radiansPerWidth;
  state.targetPitch = clamp(state.targetPitch + (touch ? 0 : (y - state.y) / height * config.radiansPerHeight), -config.pitchLimit, config.pitchLimit);
  state.targetYaw += dyaw;
  // 重复的静止事件不应把最后一次真实移动速度抹掉。
  const alpha = 1 - Math.exp(-config.velocityFilterRate * dt);
  state.velocityYaw += (clamp(dyaw / dt, -config.maxVelocity, config.maxVelocity) - state.velocityYaw) * alpha;
  state.x = x;
  state.y = y;
  state.lastMoveAt = now;
}

export function endDrag(state: DragState, now: number, cancelled: boolean) {
  state.pointerId = null;
  state.targetPitch = 0;
  state.velocityPitch = 0;
  if (cancelled || now - state.lastMoveAt > config.releaseWindowMs) state.velocityYaw = 0;
  if (cancelled) {
    state.targetYaw = state.yaw;
    state.snapTarget = null;
    state.snapping = false;
    return;
  }
  // 先预测惯性自然停下的位置，再选附近停靠点，避免快速甩动被提前截住。
  const rest = state.targetYaw + state.velocityYaw / config.inertiaDecay;
  const anchor = nearestView(rest);
  if (Math.abs(anchor.yaw - rest) <= config.snapThreshold) {
    state.snapTarget = anchor.yaw;
    state.targetPitch = anchor.pitch;
  }
}

export function resetDrag(state: DragState) {
  state.targetYaw = Math.round(state.yaw / (Math.PI * 2)) * Math.PI * 2;
  state.targetPitch = 0;
  state.velocityYaw = 0;
  state.velocityPitch = 0;
  state.snapTarget = null;
  state.snapping = false;
  state.resetting = true;
  state.allowPoseTurn = true;
}

export function stepDrag(state: DragState, delta: number) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  if (state.pointerId !== null || state.resetting) {
    const rate = state.resetting ? config.resetRate : config.followRate;
    state.yaw = follow(state.yaw, state.targetYaw, rate, dt);
    state.pitch = clamp(follow(state.pitch, state.targetPitch, rate, dt), -config.pitchLimit, config.pitchLimit);
    if (state.resetting && Math.abs(state.yaw - state.targetYaw) < 0.0001 && Math.abs(state.pitch) < 0.0001) {
      state.yaw = state.targetYaw;
      state.pitch = 0;
      state.resetting = false;
    }
    return;
  }

  [state.pitch, state.velocityPitch] = spring(state.pitch, state.velocityPitch, state.targetPitch, config.pitchReturnRate, dt);
  if (Math.abs(state.pitch - state.targetPitch) < 0.0001 && Math.abs(state.velocityPitch) < 0.0001) {
    state.pitch = state.targetPitch;
    state.velocityPitch = 0;
  }

  if (state.snapTarget !== null && Math.abs(state.velocityYaw) < config.snapStartVelocity) state.snapping = true;
  if (state.snapping && state.snapTarget !== null) {
    [state.yaw, state.velocityYaw] = spring(state.yaw, state.velocityYaw, state.snapTarget, config.snapRate, dt);
    state.targetYaw = state.yaw;
    if (Math.abs(state.yaw - state.snapTarget) < 0.0001 && Math.abs(state.velocityYaw) < 0.0001) {
      state.yaw = state.targetYaw = state.snapTarget;
      state.velocityYaw = 0;
      state.snapTarget = null;
      state.snapping = false;
    }
  } else {
    const decay = Math.exp(-config.inertiaDecay * dt);
    state.targetYaw += state.velocityYaw * (1 - decay) / config.inertiaDecay;
    state.velocityYaw *= decay;
    state.yaw = follow(state.yaw, state.targetYaw, config.followRate, dt);
  }
}
