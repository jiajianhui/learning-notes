'use client';

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { poses, poseNames } from '@/lib/poses';
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
  const [selection, setSelection] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [environment, setEnvironment] = useState(true);
  const { input, reset, handlers } = useProductDrag();

  function selectPose(name: string) {
    setPoseName(name);
    setSelection(value => value + 1);
    setScrub(null);
    reset();
  }

  function stepSelection(direction: number) {
    const index = (poseNames.indexOf(poseName) + direction + poseNames.length) % poseNames.length;
    selectPose(poseNames[index]);
  }

  const rail = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = rail.current;
    const chip = nav?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!nav || !chip || nav.scrollWidth <= nav.clientWidth) return;
    const offset = chip.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollTo({
      left: nav.scrollLeft + offset - (nav.clientWidth - chip.offsetWidth) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [poseName]);

  const detail = <>
    <p>{poses[poseName].description}</p>
    {poseName === 'foldable' && <label className="fold-control">开合程度
      <input type="range" min="0" max="1" step="0.001" value={scrub ?? poses.foldable.time / 2}
        onChange={event => setScrub(Number(event.target.value))} />
    </label>}
  </>;

  return <>
    <header className="page-header">
      <h1 lang="en">Take a closer look.</h1>
      <div className="tools">
        <button onClick={() => selectPose(poseName)}>复位视角</button>
        <label><input type="checkbox" checked={environment} onChange={e => setEnvironment(e.target.checked)} />环境反射</label>
        <a href="https://github.com/akashtdev/iphone-duo-animation" aria-label="在 GitHub 查看 Akash 的原项目" title="Akash · GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.556-1.113-4.556-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" /></svg>
        </a>
      </div>
    </header>
    <section className="demo" aria-label="iPhone Duo 交互展示" onKeyDown={event => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        stepSelection(event.key === 'ArrowDown' ? 1 : -1);
      }
    }}>
      <aside className="highlights" aria-label="产品亮点">
        <div className="steps">
          {[-1, 1].map(direction => <button key={direction}
            aria-label={direction < 0 ? '上一姿态' : '下一姿态'} onClick={() => stepSelection(direction)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={direction < 0 ? 'm6.5 14.5 5.5-5.5 5.5 5.5' : 'm6.5 9.5 5.5 5.5 5.5-5.5'} />
            </svg>
          </button>)}
        </div>
        <div className="mobile-detail">{detail}</div>
        <nav ref={rail} className="rail" aria-label="展示姿态">
          {poseNames.map(name => {
            const selected = poseName === name;
            return <div className="card" data-open={selected} key={name}>
              <button className="chip" aria-pressed={selected} onClick={() => selectPose(name)}>
                <span aria-hidden="true" className="mark">{name === 'foldable' ? '‹›' : '+'}</span>{poses[name].label}
              </button>
              <div className="detail" inert={!selected}><div>
                {selected ? detail : <p>{poses[name].description}</p>}
              </div></div>
            </div>;
          })}
        </nav>
      </aside>
    <ViewerError>
      <div className="viewport" {...handlers}>
        {active && <p className="loading" role="status">正在加载模型…</p>}
        <Canvas camera={{ position: renderConfig.cameraPosition, fov: renderConfig.fov, near: 0.1, far: 100 }} dpr={renderConfig.dpr}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: renderConfig.exposure }}
          fallback={<p>当前设备无法显示 3D，可先阅读项目说明。</p>}>
          <Suspense fallback={null}>
            <PhoneScene onTap={() => {
              if (poseName === 'foldable') selectPose((scrub ?? 1 / 3) >= 0.5 ? 'closed' : 'landscape');
              else if (poseName === 'portrait') selectPose('landscape');
              else if (poseName === 'seated' || poseName === 'standing' || poseName === 'durability') selectPose('closed');
            }} selection={selection} scrub={scrub} pose={poses[poseName]} input={input} environment={environment} />
          </Suspense>
        </Canvas>
      </div>
    </ViewerError>
    </section>
  </>;
}
