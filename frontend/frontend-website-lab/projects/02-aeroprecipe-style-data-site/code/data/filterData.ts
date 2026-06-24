import { FilterGroup } from "./types/filter";

// 筛选栏数据
export const filterGroups: FilterGroup[] = [
  {
    title: "Category",
    layout: "flex-col",
    optionWidth: "w-full",
    options: [
      { label: "Championship", icon: "/recipeIcon/cat_crown.svg" },
      { label: "Experimental", icon: "/recipeIcon/cat_experimental.svg" },
      { label: "From a Barista", icon: "/recipeIcon/noun_tamper.svg" },
      { label: "From an Enthusiast", icon: "/recipeIcon/icon_enthusiast.svg" },
    ],
  },
  {
    title: "Orientation",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [
      { label: "Standard", icon: "/recipeIcon/icon_aeropress_standard.svg" },
      { label: "Inverted", icon: "/recipeIcon/icon_aeropress_inverted.svg" },
    ],
  },
  {
    title: "Filter type",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [
      { label: "Paper", icon: "/recipeIcon/icon_filter_paper.svg" },
      { label: "Metal", icon: "/recipeIcon/icon_filter_metal.svg" },
    ],
  },
  {
    title: "Brew time (minutes)",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [
      { label: "<2", icon: "/recipeIcon/icon_timer_fast.svg" },
      { label: "2-5", icon: "/recipeIcon/icon_timer_medium.svg" },
      { label: "5+", icon: "/recipeIcon/icon_timer_slow.svg" },
    ],
  },
  {
    title: "Amount of coffee",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [{ label: "<15g" }, { label: "15-20g" }, { label: ">20g" }],
  },
  {
    title: "Amount of water",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [{ label: "<200" }, { label: "200-300" }, { label: ">300" }],
  },
  {
    title: "Tags",
    layout: "flex-row flex-wrap",
    optionWidth: "auto",
    options: [
      { label: "AeroPress Go", icon: "/recipeIcon/aeropress_go.svg" },
      { label: "Has Video", icon: "/recipeIcon/icon_video.svg" },
      { label: "Cold", icon: "/recipeIcon/icon_cold.svg" },
      { label: "Fruit Filter", icon: "/recipeIcon/fruit_filter.svg" },
      { label: "AeroPress XL", icon: "/recipeIcon/icon_aeropress_xl.svg" },
      { label: "Sweet", icon: "/recipeIcon/icon_sweet.svg" },
    ],
  },
];

