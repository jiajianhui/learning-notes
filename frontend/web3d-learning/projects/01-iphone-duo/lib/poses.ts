export type Pose = {
  label: string;
  time: number;
  rotation: [number, number, number];
  center: [number, number, number];
  bounds: [number, number]; // 修正朝向后，姿态的近似宽高；用于取景。
};

// Our display settings, not Apple's camera configuration. Slider lasts 2 seconds.
export const poses: Record<string, Pose> = {
  landscape: { label: '横向展开', time: 2, rotation: [0, 0, 0], center: [0.022, -0.282, -0.022], bounds: [16.4, 11.9] },
  portrait: { label: '纵向展开', time: 2, rotation: [0, 0, Math.PI / 2], center: [0.022, -0.282, -0.022], bounds: [11.9, 16.4] },
  closed: { label: '合拢', time: 0, rotation: [0, 0, 0], center: [4.025, -0.012, -0.022], bounds: [8.4, 11.9] },
  seated: { label: '半折叠', time: 1, rotation: [0.4, 0, 0], center: [3.865, 3.831, -0.022], bounds: [11.9, 11.9] },
};
