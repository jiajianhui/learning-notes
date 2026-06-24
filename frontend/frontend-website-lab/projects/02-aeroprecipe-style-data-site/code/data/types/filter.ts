// 筛选分组的数据模型
export type FilterGroup = {
  title: string;
  layout: string;
  optionWidth: string;
  options: FilterOption[];
};

// 筛选项(options)的数据模型
export type FilterOption = {
  label: string;
  icon?: string;
};
