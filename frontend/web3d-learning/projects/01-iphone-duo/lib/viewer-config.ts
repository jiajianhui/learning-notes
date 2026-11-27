// 代码侧调校入口。数值是本练习的选择，不是官网参数。
export const renderConfig = {
  dpr: [1.5, 2] as [number, number],
  exposure: 1,
  background: '#ffffff',
  cameraPosition: [0, 0, 10] as [number, number, number],
  fov: 20,
  frameFill: 0.84, // 按每种姿态的宽高取景，保留旋转时的边缘余量。
  maxAnisotropy: 8,
};

export const studioConfig = {
  resolution: 256,
  updatesPerSecond: 15, // 只在观察方向或开合变化时更新离屏棚拍。
};

export const materialConfig = {
  bodyEnvironmentIntensity: 1,
  metalEnvironmentIntensity: 1,
  lensReflectionIntensity: 1,
  lensOpticsIntensity: 1.5,
  logoBaseColorScale: 0.78, // 只调 Logo 底色，保留背板原有亮度。
  metalRoughnessScale: 1, // 以原材质为基准；1 保留原来的抛光程度。
  screenRoughness: 0.08,
  screenClearcoat: 0,
  screenBrightness: 1,
};

export const motionConfig = {
  radiansPerWidth: Math.PI * 1.6,
  radiansPerHeight: Math.PI * 0.45,
  pitchLimit: Math.PI / 12, // 相对预设姿态上下各 15°，松手回正。
  followRate: 32,         // 拖动目标的追随速度，越大越紧。
  resetRate: 14,
  poseRate: 12,
  velocityFilterRate: 25,
  inertiaDecay: 4.2,
  maxVelocity: 8,
  releaseWindowMs: 120,
  pitchReturnRate: 12,
  snapStep: Math.PI / 4,
  snapThreshold: 25 * Math.PI / 180,
  snapStartVelocity: 0.45,
  snapRate: 10,
};
