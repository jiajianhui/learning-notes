// 官网角度表以背面为 theta=0，工程以闭合正面为 yaw=0。
const half = Math.PI / 2;
export const referenceViews = [
  { name: 'front', yaw: 0, pitch: 0 },
  { name: 'frontRight', yaw: Math.PI / 4, pitch: 0 },
  { name: 'right', yaw: Math.PI - 1.56, pitch: half - 1.41 },
  { name: 'backRight', yaw: 3 * Math.PI / 4, pitch: 0 },
  { name: 'back', yaw: Math.PI, pitch: 0 },
  { name: 'backLeft', yaw: 5 * Math.PI / 4, pitch: 0 },
  { name: 'left', yaw: 3 * Math.PI - 4.716, pitch: half - 1.45 },
  { name: 'frontLeft', yaw: 7 * Math.PI / 4, pitch: 0 },
];

export function nearestView(yaw: number) {
  const turn = 2 * Math.PI;
  const candidates = referenceViews.map(view => ({
    yaw: view.yaw + turn * Math.round((yaw - view.yaw) / turn),
    pitch: view.pitch,
  }));
  return candidates.reduce((best, view) =>
    Math.abs(view.yaw - yaw) < Math.abs(best.yaw - yaw) ? view : best);
}
