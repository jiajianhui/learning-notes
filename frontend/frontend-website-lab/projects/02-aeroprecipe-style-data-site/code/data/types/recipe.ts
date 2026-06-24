// 单条咖啡冲煮配方的数据模型
export type Recipe = {
  // 配方唯一 ID
  // 一般用于 React 列表的 key、数据库查询等
  id: number;

  // 配方路径标识
  // 用于生成详情页地址，例如：
  // /recipes/for-the-sweetest-cup
  slug: string;

  // 配方来源信息
  source: {
    // 来源名称，例如：From a Barista
    name: string;

    // 来源图标地址
    icon: string;
  };

  // 配方标题
  title: string;

  // 配方简短描述
  // 通常显示在列表卡片或详情页标题下面
  description: string;

  // 是否包含教学视频
  hasVideo: boolean;

  // 是否为冷萃或冰饮配方
  isCold: boolean;

  // 配方相关统计数据
  stats: {
    // 点赞或投票数量
    votes: number;

    // 收藏数量
    saves: number;

    // 评论数量
    comments: number;
  };

  // 配方创作者信息
  creator: {
    // 创作者姓名
    name: string;

    // 创作者个人主页地址；可选属性：并不是每个作者都有明确的个人主页
    profileUrl?: string;

    // 创作者简介
    introduction: string;
  };

  // 配方详细介绍
  // 使用数组是因为详情介绍可能有多个段落
  introduction: string[];

  // 冲煮注意事项
  // 每个字符串代表一条提示
  notes: string[];

  // 配方核心冲煮参数
  recipeDetails: {
    // AeroPress 的放置方式
    // Standard：正置
    // Inverted：倒置
    orientation: "Standard" | "Inverted";

    // 总冲煮时间
    // 单位为秒，例如 120 表示 2 分钟
    brewTime: number;

    // 滤纸类型；
    // `filterType` 只能是 `"Paper"` 或 `"Metal"`，这叫字符串字面量联合类型。
    filterType: "Paper" | "Metal";

    // 使用的滤纸数量
    filterCount: number;

    // 咖啡粉与水的比例
    // 例如："1:10"
    ratio: string;
  };

  // 咖啡粉相关参数
  coffee: {
    // 咖啡粉重量
    amount: number;

    // 咖啡粉重量单位
    // 当前固定为克
    unit: "g";

    // 对咖啡豆或风味的补充说明
    description: string;
  };

  // 研磨参数
  grind: {
    // 研磨粗细
    // 例如：Fine、Medium、Coarse
    size: string;
  };

  // 冲煮用水参数
  water: {
    // 水量
    amount: number;

    // 水量单位
    // 可以使用克或毫升
    unit: "g" | "ml";

    // 摄氏温度
    temperatureCelsius: number;

    // 华氏温度
    temperatureFahrenheit: number;
  };

  // 冲煮所需器具列表
  equipment: {
    // 器具名称
    name: string;

    // 器具相关链接
    // ? 表示这个属性可以没有
    url?: string;
  }[];

  // 冲煮步骤列表
  steps: {
    // 每个步骤的唯一 ID
    id: number;

    // 当前步骤的具体操作说明
    text: string;
  }[];
};
