// 展示设计取自 akashtdev/iphone-duo-animation；坐标与取景按本地 glTF 校准。
export type Pose = {
  label: string;
  description: string;
  time: number; // Slider 动画 0–2 秒，对应 openness 0–1
  rotation: [number, number, number];
  center: [number, number, number];
  bounds: [number, number];
  zoom?: number;
};
const quarter = Math.PI / 2;
export const poses: Record<string, Pose> = {
  foldable: { label: '折叠设计', description: '拖动滑块，观察铰链如何带动两侧屏幕。', time: 2 / 3, rotation: [0, 0, 0], center: [4, 3.3, 0], bounds: [11.9, 11.9] },
  landscape: { label: '横向展开', description: '展开内屏，观察两片机身如何连成一个平面。', time: 2, rotation: [0.07, 0, 0], center: [0.022, -0.282, -0.022], bounds: [16.4, 11.9] },
  portrait: { label: '纵向展开', description: '保持内屏展开，将机身转至纵向。', time: 2, rotation: [0.05, 0, quarter], center: [0.022, -0.282, -0.022], bounds: [11.9, 16.4] },
  closed: { label: '合拢', description: '正面查看外屏，拖动可检查侧框和机背。', time: 0, rotation: [0, 0, 0], center: [4.025, -0.012, -0.022], bounds: [8.4, 11.9] },
  seated: { label: '坐姿', description: '机身半开，下半部支撑上半部。', time: 1, rotation: [0.23, 0, quarter], center: [3.865, 3.831, -0.022], bounds: [11.9, 11.9] },
  standing: { label: '帐篷支架', description: '两片机身形成支架，外屏朝外。', time: 0.8, rotation: [0.63, 0.3, -quarter], center: [4, 3.65, 0], bounds: [12, 12] },
  durability: { label: '边框特写', description: '近距离观察铰链、金属倒角和镜头边缘。', time: 0.9, rotation: [-0.1, 2.3, 0], center: [4, 3.75, 0], bounds: [12, 12], zoom: 1.28 },
};
export const poseNames = Object.keys(poses);
export const transitionSeconds = 1.15;
export function poseEase(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  return t < 0.5 ? 4 * t ** 3 : 1 - 4 * (1 - t) ** 3;
}
