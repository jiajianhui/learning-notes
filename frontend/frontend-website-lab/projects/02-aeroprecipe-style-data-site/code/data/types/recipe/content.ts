// 定义一个 “内容块”类型
// 一篇详情页正文可以由不同类型的模块组成，例如段落、标题、列表、链接段落、视频。
// ContentBlock 不是一种固定结构；它表示下面五种对象中的任意一种：
// 段落 | 标题 | 列表 | 链接段落 | 视频;
export type ContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "linkParagraph";
      text: string;
      linkText: string;
      href: string;
    }
  | {
      type: "video";
      title?: string;
      url: string;
    };
