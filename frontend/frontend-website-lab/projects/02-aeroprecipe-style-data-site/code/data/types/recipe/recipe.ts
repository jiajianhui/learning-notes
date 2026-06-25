/* 
  详情页的固定结构：
   1、顶部标题及元信息
   2、中间内容块（段落、标题、列表、视频等）
   3、步骤列表
   4、右侧 Recipe overview
*/

/* 
  `import type` 表示这个导入只用于 TypeScript 类型检查
  不会成为浏览器实际运行的 JavaScript 代码。
*/
import type { ContentBlock } from "./content";
import type { RecipeOverview } from "./recipeOverview";

export type Recipe = {
  id: number;

  // 路由标识，用于生成详情页地址
  slug: string;

  // 标题
  title: string;

  // 描述，网格卡片显示
  intro: string;

  // 是否为冷饮配方
  isCold: boolean;

  // 元信息：来源、作者、统计数据
  meta: {
    source: {
      icon: string;
      name: string;
    };
    creator: {
      name: string;
      url?: string;
    };
    likes: number;
    saves: number;
    comments: number;
    privateNotes: number;
  };

  // 内容区域
  content: ContentBlock[];

  // 冲煮步骤
  steps: {
    id: number;
    text: string;
  }[];

  overview: RecipeOverview;
};
