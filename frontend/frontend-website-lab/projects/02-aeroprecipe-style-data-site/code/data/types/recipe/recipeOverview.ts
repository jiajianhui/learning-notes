export type RecipeOverview = {
  // 冲煮方式
  brew: {
    method: "standard" | "inverted";
    time: number;
    filter: string;
  };

  // 咖啡豆用量
  coffee: {
    amount: number;
    unit: "g";
    description?: string;
  };

  // 研磨设置
  grind: {
    // 研磨粗细
    level: string;

    // 指定磨豆机的参考刻度
    grinder?: {
      model: string;
      setting: string;
    };
  };

  // 冲煮用水
  water: {
    amount: number;
    temperature: number;
    unit: "g" | "ml";
  };

  // 所需器具
  equipment: {
    id: number;
    name: string;
    image?: string;
    url?: string;
  }[];
};
