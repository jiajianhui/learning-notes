// 自定义类型通常用 `export type` 导出、再用 `import type` 引入，不要默认做成全局类型。

export type Slide = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageSize: string;
  imagePosition: string;
  mobileImageSize: string;
  mobileImagePosition: string;
};
