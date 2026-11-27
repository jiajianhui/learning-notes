# 03. 在 Next.js 中建立材质实验台

本章先运行一个不需要模型、HDRI 或远程字体的场景，再加载第 02 章导出的 GLB。先用可控的几何体确认网页能表现不同材质。

这是独立的排错实验，不是第一阶段必做的启动项目。iPhone Duo 已有 [配套工程](./projects/01-iphone-duo/README.md)；这里的 `phone-lab` 留给材质对照和第二阶段自制模型。

## 第一步：创建练习项目

在本专题目录 `frontend/web3d-learning/` 执行：

```bash
mkdir -p projects
npx create-next-app@16 projects/phone-lab --typescript --eslint --app --no-tailwind --no-src-dir --use-npm --import-alias "@/*" --disable-git --yes
cd projects/phone-lab
npm install --save-exact three@0.180.0 @react-three/fiber@9.8.2 @react-three/drei@10.7.9
npm install -D --save-exact @types/three@0.180.0
npm ls next react react-dom three @react-three/fiber @react-three/drei
```

这里有意使用一组明确的 WebGL 学习基线，而不是把所有 3D 包都装成 `latest`。Next.js 使用 16 系列，React 与 React DOM 保持同版本的 19 系列，并满足 R3F 的 peer dependencies。R3F 9.8.2 的 React 范围是 `>=19 <19.4`；如果脚手架未来产生不兼容的版本，先按 peer 提示协调版本，不使用 `--force` 跳过。

保留生成的 `package-lock.json`。本文示例的验证组合见本章末尾；它是复现记录，不代表应永远停留在这些补丁版本。

需要的文件如下。除明确替换的文件外，保留脚手架配置。

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  viewer.tsx
  material-lab.tsx
```

## 第二步：建立页面与 3D 的边界

Next.js 的 Client Component 仍可能参与服务端预渲染。这里用一个很小的客户端入口动态加载 3D 模块，确保该模块只在浏览器执行。`ssr: false` 要放在 Client Component 中。[Next.js Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading)

替换 `app/layout.tsx`，去掉脚手架的远程字体依赖：

```tsx
import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

替换 `app/page.tsx`：

```tsx
import Viewer from '@/components/viewer';

export default function Page() {
  return (
    <main>
      <h1>我的材质实验台</h1>
      <p>左侧是塑料，中间是金属，右侧是关闭的屏幕。拖动观察反射。</p>
      <Viewer />
    </main>
  );
}
```

新增 `components/viewer.tsx`：

```tsx
'use client';

import dynamic from 'next/dynamic';

const MaterialLab = dynamic(() => import('./material-lab'), {
  ssr: false,
  loading: () => <p role="status">正在准备 3D 实验台…</p>,
});

export default function Viewer() {
  return <MaterialLab />;
}
```

替换 `app/globals.css`：

```css
* { box-sizing: border-box; }
body { margin: 0; background: #161920; color: #edf0f5; font-family: system-ui, sans-serif; }
main { max-width: 1100px; margin: auto; padding: 24px 16px; }
h1 { font-size: clamp(24px, 4vw, 40px); }
p { line-height: 1.7; }
.viewport { height: min(65vh, 620px); min-height: 340px; border-radius: 16px; overflow: hidden; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin: 16px 0; }
label { display: flex; align-items: center; gap: 10px; }
button { padding: 8px 16px; font: inherit; cursor: pointer; }
```

此时继续完成第三步再运行，下一步会补齐正在引用的 3D 模块。

## 第三步：一次跑通可旋转、可调参的场景

新增 `components/material-lab.tsx`：

```tsx
'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer position={[-3, 3, 4]} target={[0, 0, 0]} scale={[3, 5, 1]} intensity={3} />
      <Lightformer position={[4, 1, 2]} target={[0, 0, 0]} scale={[1, 4, 1]} intensity={2} />
      <Lightformer position={[0, 4, -3]} target={[0, 0, 0]} scale={[3, 2, 1]} intensity={2} />
    </Environment>
  );
}

export default function MaterialLab() {
  const [roughness, setRoughness] = useState(0.3);
  const [showEnvironment, setShowEnvironment] = useState(true);

  return (
    <>
      <div className="controls">
        <label>
          塑料与金属粗糙度 {roughness.toFixed(2)}
          <input
            type="range" min="0.05" max="0.9" step="0.01" value={roughness}
            onChange={(event) => setRoughness(Number(event.target.value))}
          />
        </label>
        <label>
          <input type="checkbox" checked={showEnvironment}
            onChange={(event) => setShowEnvironment(event.target.checked)} />
          棚拍环境
        </label>
      </div>
      <div className="viewport">
        <Canvas
          camera={{ position: [4, 2.5, 7], fov: 35 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1 }}
          fallback={<p>当前设备无法显示 3D，请使用支持 WebGL 的浏览器。</p>}
        >
          <color attach="background" args={['#202530']} />
          <ambientLight intensity={0.15} />
          <directionalLight position={[3, 4, 5]} intensity={2} />
          {showEnvironment && <Studio />}
          <RoundedBox args={[1, 1, 0.5]} radius={0.08} smoothness={4} position={[-1.5, 0, 0]}>
            <meshStandardMaterial color="#a94532" metalness={0} roughness={roughness} />
          </RoundedBox>
          <mesh>
            <sphereGeometry args={[0.55, 48, 32]} />
            <meshStandardMaterial color="#b8bec7" metalness={1} roughness={roughness} />
          </mesh>
          <RoundedBox args={[0.9, 1.25, 0.12]} radius={0.04} smoothness={4} position={[1.5, 0, 0]}>
            <meshPhysicalMaterial color="#080b10" metalness={0} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
          </RoundedBox>
          <ContactShadows position={[0, -0.7, 0]} opacity={0.35} scale={8} blur={2} far={4} frames={1} />
          <OrbitControls makeDefault enablePan={false} minDistance={4} maxDistance={12} />
        </Canvas>
      </div>
    </>
  );
}
```

运行：

```bash
npm run dev
```

打开终端显示的本地地址。应看到三个物体，可以拖动旋转视角，滑块能改变塑料与金属的高光。

这里每个组件都对应一个可观察结果：

- `Canvas` 创建渲染器与默认相机；容器高度决定画布是否可见。
- `mesh` 把几何形状和材质组合成可渲染物体。
- `Environment` 将子场景捕获成环境贴图；`Lightformer` 在其中提供可控的亮面，用来塑造反射。
- `ContactShadows` 做近地阴影近似，帮助物体落地；它不是完整的实时全局光照。
- `OrbitControls` 让相机围绕目标转动；`makeDefault` 让其他组件知道默认控制器是谁。

Lightformer 在环境中主要负责照明与反射的形状，不是一个会自动给地面投射准确阴影的灯。[Lightformer 官方说明](https://drei.docs.pmnd.rs/staging/lightformer)

现在完成三次实验，每次只改一个变量：

| 操作 | 预期观察 | 要回答的问题 |
|---|---|---|
| 关闭棚拍环境 | 金属明显失去大面积反射信息，直接灯仍可能形成高光 | 为什么只有一盏灯，金属就不够像金属？ |
| 粗糙度从 0.1 调到 0.7 | 反射变模糊，高光分布改变 | 为什么 roughness 不是简单的亮度开关？ |
| 拖动视角 | 高光随观察方向变化 | 如果高光烘焙在颜色图里，会出现什么区别？ |

`frames={1}` 适合当前不变化的环境和阴影。修改灯牌后若热更新没有刷新捕获，刷新页面；未来做实时调参需重新触发捕获，不能把单次捕获误认为实时更新。

## 第四步：加载自己的 GLB，保留原材质

先保存一张实验台截图，再把第 02 章的模型复制到项目的 `public/models/phone.glb`。浏览器访问路径是 `/models/phone.glb`，不包含 `public`。

新增 `components/phone-model.tsx`，这是完整文件：

```tsx
'use client';

import { useGLTF } from '@react-three/drei';

export default function PhoneModel() {
  const { scene } = useGLTF('/models/phone.glb');
  return <primitive object={scene} />;
}
```

在 `material-lab.tsx` 中做以下局部修改，其余保留：

1. React 导入增加 `Suspense`。
2. Drei 导入增加 `Bounds`、`Html`，移除不再使用的 `ContactShadows`、`RoundedBox`。
3. 导入 `PhoneModel`：`import PhoneModel from './phone-model';`。
4. 删除三个样片和 `ContactShadows`，换成下面内容。

```tsx
<Suspense fallback={<Html center><span role="status">正在加载模型…</span></Html>}>
  <Bounds fit clip observe margin={1.3}>
    <PhoneModel />
  </Bounds>
</Suspense>
```

5. 把控制器改成 `<OrbitControls makeDefault enablePan={false} />`。样片的距离限制不适合真实尺寸的小模型，先让 Bounds 自动取景。
6. 删除 roughness 状态及粗糙度滑块，保留环境开关。导入的材质使用自己的粗糙度，旧滑块已不再控制它。

Bounds 根据包围盒调整取景，减少“模型太小，看不见”的干扰。此时没有地面阴影；等模型朝向、实际尺寸和摆放位置确定后，再按其大小放置地面和阴影。

先不要遍历模型，把每个 mesh 都换成同一种新材质。GLTFLoader 会按模型描述读取材质与贴图；整体覆盖会丢失你在 Blender 里做好的区别。[GLTFLoader 文档](https://threejs.org/docs/pages/GLTFLoader.html)

这个简单版本只挂载一份 `scene`。未来同时展示多台相同模型时，使用实例、克隆或 gltfjsx；不要在多个位置重复挂载同一个 Object3D。

**检查点**：模型可以旋转；颜色分区、图标和法线都在；关闭环境后反射发生变化。然后使用 [第 04 章](./04-材质灯光与色彩校准.md) 校准效果。

## 第五步：让加载失败有可见结果

`Suspense` 负责等待，不负责吞掉加载错误。在 `app/error.tsx` 新增路由错误边界：

```tsx
'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <h1>3D 场景暂时无法加载</h1>
      <p>请检查网络、模型路径与文件格式。修复后可以重试。</p>
      <button onClick={() => reset()}>重试</button>
    </main>
  );
}
```

暂时把 GLB 路径改错，确认能看到失败提示，再恢复。加载器可能缓存失败结果，恢复资源后若重试仍失败，完整刷新页面。生产版本可以把错误边界缩小到 3D 区域，并保留设备介绍和静态预览；见第 06 章。

完成后执行：

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 示例验证记录

本章以临时项目验证示例，不在仓库中附带生成后的练习项目。验证组合：Next.js 16.2.10、React / React DOM 19.2.4、Three.js / `@types/three` 0.180.0、R3F 9.8.2、Drei 10.7.9。

已验证无外部模型的实验台通过 TypeScript 检查和生产构建；浏览器中确认了三种样片、环境开关、粗糙度调节和视角旋转。第 05 章的独立铰链组件也做了类型检查。

本章的独立实验没有附带自制手机 GLB，也未在 Blender 内实作烘焙。第一阶段的 Apple 资产另见该项目，不使用这里的 `phone.glb` 路径。具体资产的导出、视觉与交互验收仍要使用你自己制作的模型，按前面的检查点完成。
