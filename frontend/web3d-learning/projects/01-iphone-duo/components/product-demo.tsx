'use client';

import { Component, Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { poses } from '@/lib/poses';
import { renderConfig } from '@/lib/viewer-config';
import { useProductDrag } from './use-product-drag';
import PhoneScene from './phone-scene';

class ViewerError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="notice" role="alert">
      <p>3D 资源加载失败。请确认已经完成资产准备，再刷新重试。</p>
      <button onClick={() => window.location.reload()}>重新加载</button>
    </div>;
    return this.props.children;
  }
}

export default function ProductDemo() {
  const { active } = useProgress();
  const [poseName, setPoseName] = useState('closed');
  const [environment, setEnvironment] = useState(true);
  const { input, reset, handlers } = useProductDrag();

  function selectPose(name: string) {
    setPoseName(name);
    reset();
  }

  return <section className="demo" aria-label="iPhone Duo 交互展示">
    <aside>
      <p className="eyebrow">选择一种姿态</p>
      <nav aria-label="展示姿态">
        {Object.entries(poses).map(([name, pose]) =>
          <button key={name} aria-pressed={poseName === name} onClick={() => selectPose(name)}>{pose.label}</button>
        )}
      </nav>
      <button className="secondary" onClick={() => selectPose(poseName)}>复位视角</button>
      <label><input type="checkbox" checked={environment} onChange={e => setEnvironment(e.target.checked)} />环境反射</label>
      <p className="hint">拖动旋转，松手缓停并吸附视角。鼠标上下微调后回正；手机纵向可滚动页面。</p>
    </aside>
    <ViewerError>
      <div className="viewport" {...handlers}>
        {active && <p className="loading" role="status">正在加载模型…</p>}
        <Canvas camera={{ position: renderConfig.cameraPosition, fov: renderConfig.fov, near: 0.1, far: 100 }} dpr={renderConfig.dpr}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: renderConfig.exposure }}
          fallback={<p>当前设备无法显示 3D，可先阅读项目说明。</p>}>
          <Suspense fallback={null}>
            <PhoneScene pose={poses[poseName]} input={input} environment={environment} />
          </Suspense>
        </Canvas>
      </div>
    </ViewerError>
  </section>;
}
