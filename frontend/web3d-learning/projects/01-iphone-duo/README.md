# iPhone Duo 3D 展示

基于 Next.js、React Three Fiber 和 Three.js 的折叠手机展示。页面参考 Akash 的折叠展台，支持七个姿态切换、滑块开合、拖动旋转和松手吸附。屏幕使用静态合成图。[Akash 原项目](https://github.com/akashtdev/iphone-duo-animation/tree/6a670ad)

## 本地运行

使用 Node.js 20.9 或更高的兼容版本。先将完整资产目录放到 `public/models/iphone-duo/`，其中包括 `phone.gltf`、模型引用的二进制文件与图片、EXR 环境图和 `studio/`。资产单独交付，新克隆后需自行准备。Apple 素材用于本地学习，公开展示时请使用有相应授权的资产。[资产清单](./asset-manifest.json)

```bash
npm ci
npm run dev
```

打开终端显示的本地地址。类型与构建检查使用 `npm run typecheck` 和 `npm run build`，交互与布光检查使用 `npm run check:interaction` 和 `npm run check:studio`。

[工程学习文档](./docs/学习路线.md)
