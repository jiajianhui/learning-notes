# 01. Akash折叠展示拆解

运行项目后，先合拢手机，慢慢转到侧面观察铰链。再点「纵向展开」，尚未转完就按 ↓。值得跟读的是这两个瞬间：银色亮带如何沿曲面移动，以及第二次点击怎样从眼前这一帧开始。

本章对应 Akash T 的 TypeScript、Vite、Three.js 项目，源码固定到提交 `6a670ad`。本地入口使用 Next.js App Router、React Three Fiber 和已有的 glTF 模型。[上游源码](https://github.com/akashtdev/iphone-duo-animation/tree/6a670ad) · [上游演示](https://akashtdev.github.io/iphone-duo-animation/?clear=1)

## 为什么一套简单的灯光能把边框照好

上游加载 Apple 的 USDC 模型。圆角、细窄的倒角、镜圈和接缝都有实际几何。产品旋转时，倒角上的法线逐渐改变，旁边两个像素便可能分别映出室内亮面和暗面。清晰度来自几何、取景、抗锯齿和纹理采样共同作用。上游还有一项容易漏掉的处理：检测加载后没有图像的材质贴图，解除无效引用，必要时恢复机壳底色。[模型处理](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/device/foldable.ts)

光源来自 Three.js 的 RoomEnvironment。它提供有尺寸、有方向的亮面。PMREM 先把房间过滤成适合不同粗糙度采样的环境图，fromScene 的 0.04 是预模糊参数。作者用 ACES、曝光 1、环境强度 0.85。转动金属时，同一块房间亮面会沿不同曲率的表面形成不同宽度的反光。[上游 stage.ts](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/stage/stage.ts)

作者的 matchFrame 针对四个铰链内衬和盖板网格。它把底色设为暖银色 0xe3d9c8，金属度设为 1，粗糙度设为 0.16，同时移除这些零件原有的底色、遮蔽、粗糙度和金属度贴图。这样黑色内衬能读成与边框连续的金属面。换用另一个模型时，需要先重新确认零件，直接照搬上游的四个网格名称不会命中本地 glTF。

**本地跟练。** 在 [use-studio-maps.ts](../components/use-studio-maps.ts) 找到 roomMap，再到 [model-materials.ts](../lib/model-materials.ts) 找 matchFrame。先只将粗糙度从 0.16 提高到 0.35，观察亮条的边沿如何变软，再恢复。外框采样固定房间环境；Logo 调色、背板环境、后摄内部与保护玻璃仍走各自的材质路径。共享源材质的中央铰链内衬单独复制后再处理。

## 点击按钮到下一帧，数据经过哪里

| 步骤 | 上游怎么做 | Next.js 项目怎么读 |
|---|---|---|
| 描述姿态 | highlights.ts 把开合量、产品朝向、相机距离与角度、偏移组合成一个条目 | [poses.ts](../lib/poses.ts) 定义七项，用本地骨骼动画时刻、旋转、中心、取景范围和特写倍率表达 |
| 接收输入 | 侧栏、上下按钮、滑块和特定姿态的产品点击触发选择 | [product-demo.tsx](../components/product-demo.tsx) 更新当前选择。上下键在控件获得焦点时可用，滑块接管开合量 |
| 开始过渡 | settleOn 读取此刻的开合、相机、角度和位置 | [phone-scene.tsx](../components/phone-scene.tsx) 保存当前骨骼时间、屏幕上可见的旋转、模型中心和大小 |
| 逐帧推进 | 1.15 秒内以三次 ease-in-out 同步插值，旋转选短路径 | useFrame 用同一 eased 更新开合、中心、缩放和四元数。到达终点后显示目标姿态 |

例如，横向展开和纵向展开的目标开合量相同，变化主要来自旋转和取景。闭合到坐姿则需要同时开铰链、转机身、移中心。各项共用同一个进度，桌面按钮便能控制完整动作。快速再点一次时，新过渡读取当前帧，原过渡随即结束。拖动后的复位也从用户眼前的朝向出发。[上游 experience.ts](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/experience.ts)

## 跟读展示页，理解控件为什么能和模型配合

先看 Akash 的桌面布局。标题下是一块连续的浅色展台，左侧胶囊按钮贴着产品，选中后在原处展开说明。上下箭头可以不移动鼠标就连续比较几个姿态。窄屏把按钮排到底部，当前说明单独显示在按钮上方。作者还会根据菜单的位置调整相机取景，产品和说明都有自己的可用空间。[原页面](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/index.html) · [原样式](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/styles.css)

**观察一次快速连点。** 上游的 rail.ts 先记录各按钮的位置和大小，切换选中项，再测一次新布局。浏览器从旧尺寸和位置过渡到新布局，同时淡入新说明。再点下一项时，菜单取消上一段动画。与前文的三维姿态插值配合，菜单和机身都能响应最后一次输入。[上游 rail.ts](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/ui/rail.ts)

在本地工程，从「合拢」按一次 ↓，顺着下面三处读：

1. `stepSelection(1)` 找到「坐姿」，调用 `selectPose`。直接点「坐姿」也进入这个函数。`poseName` 决定哪张卡片展开，`selection` 记录这次切换，所以点「复位视角」也能让同一姿态重新进入过渡。[页面事件](../components/product-demo.tsx)
2. 桌面卡片用 CSS 网格行高和透明度展开说明。窄屏改用底部横向按钮带，选中项滚到可见区域，说明和开合滑块在上方显示。两种布局共享同一个选中状态。Canvas 在独立网格区域内取景，让读说明、横滑菜单和拖动机身各自有明确的操作区域。[布局与过渡](../app/globals.css)
3. 机身读取「坐姿」的目标开合量、朝向、中心和大小，从当前帧过渡。趁转动时再按 ↓，说明应切到「帐篷支架」，机身也应从眼前的角度改向。把窗口缩窄后重复同一动作，验证换布局后姿态和开合量仍能接上。[姿态数据](../lib/poses.ts) · [逐帧更新](../components/phone-scene.tsx)

页首保留本地跟练用的「复位视角」和「环境反射」。研究边框时，先在同一侧面开关反射，再缓慢拖动，分别观察金属的底色、亮带的宽度和转过倒角时亮带的移动。

## 铰链、壁纸和手势分别由谁负责

上游在顶点着色器里绕铰链旋转活动半边，柔性屏用一小段 Hermite 曲线弯折。法线在比几何折痕更宽的区域转向，高光经过折叠处也能连续。一个 0 到 1 的 openness 同时驱动铰链与壁纸；壁纸分层、渐模糊和时钟遮挡是这条进度上的附加效果。

本地 glTF 已经有 Slider 骨骼动画。把 openness 乘以 2 得到动画秒数，给暂停的 action 设置 time，再调用 mixer.update(0)，就能在同一份模型上平滑开合。屏幕沿用静态图。指针拖动另走 [drag-motion.ts](../lib/drag-motion.ts)，保留上下限位、松手惯性、俯仰回正和八方向吸附。

## 从打开网页到第一次转动，Akash 还做了什么

初次打开上游页面时，HTML 提前以低优先级请求最大的 USDC 文件。菜单先接收输入，模型加载期间点过的姿态会被记住。随后程序并行发起资源请求，给菜单和进度条一次绘制机会，再建立 WebGL 场景；组装好模型后调用 `renderer.compileAsync` 预编译材质，减少第一次转动时才编译着色器的机会。这几步分别改善等待期间的反馈和首次交互的稳定性。[页面入口](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/index.html) · [菜单启动](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/main.ts) · [资源与场景启动顺序](https://github.com/akashtdev/iphone-duo-animation/blob/6a670ad/src/experience.ts)

本地可以在浏览器开发工具里关闭缓存并限速，刷新后先点「纵向展开」。沿客户端加载提示、模型加载提示、选中按钮和最后出现的机身依次检查。这里读到的是 Next.js 的动态导入、React 的选择状态和 Canvas 内的 Suspense；上游的 USDC 预加载与材质预编译属于单独的实现。[客户端入口](../components/viewer.tsx) · [展示组件](../components/product-demo.tsx)

## 自己验证

1. 在「折叠设计」慢拉滑块，检查铰链、屏幕、机身中心是否一起移动。
2. 合拢后先拖到背面，再快速点「横向展开 → 坐姿 → 边框特写」。观察每次切换是否从当前画面继续，最后是否到达最后一次选择。
3. 松手停在侧面，比较外框的亮带、背面 Logo 和镜头内部反光。尝试关闭环境反射，辨认哪些细节来自几何，哪些来自表面反射。

Vite 原项目的页面启动代码在 Next.js 中对应 [app/page.tsx](../app/page.tsx) 和 [viewer.tsx](../components/viewer.tsx) 的客户端加载边界。React 管理选择状态，Canvas 管理 WebGL 生命周期，逐帧计算保存在 ref 中。上游代码许可见 [MIT 声明](../notices/akashtdev-MIT.txt)。

接着打开[模型资产与格式接入](./02-模型资产与格式接入.md)，在本地资产中找到支撑这些效果的网格、材质和动画。
