'use client';

import { renderConfig } from '@/lib/viewer-config';

export default function Studio() {
  // 可见背景不参与反射。各材质的环境由 useStudioMaps 单独提供。
  return <color attach="background" args={[renderConfig.background]} />;
}
