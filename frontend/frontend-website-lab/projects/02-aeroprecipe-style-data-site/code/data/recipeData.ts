// 筛选分组的数据模型
type FilterGroup = {
  title: string;
  layout: string;
  optionWidth: string;
  options: FilterOption[];
};

// 筛选项的数据模型
type FilterOption = {
  label: string;
  icon?: string;
};

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

// 网格卡片数据
export const recipeCards = [
  {
    id: 0,
    slug: "james-hoffmanns-ultimate-aeropress-recipe",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "James Hoffmann's Ultimate AeroPress Recipe",
    description: "James Hoffmann's Ultimate AeroPress Recipe",
    hasVideo: true,
    isCold: false,
    votes: 1116,
  },
  {
    id: 1,
    slug: "13g-that-makes-you-happy",
    source: "From an Enthusiast",
    sourceIcon: "/recipeIcon/icon_enthusiast.svg",
    title: "13g that makes you happy",
    description:
      "Quick & simple. Guaranteed happiness with this clean, balanced and sweet cup.",
    hasVideo: true,
    isCold: false,
    votes: 851,
  },
  {
    id: 2,
    slug: "james-hoffmann",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "James Hoffmann",
    description:
      "James Hoffmann's AeroPress recipe for making a good milk based coffee at home.",
    hasVideo: true,
    isCold: false,
    votes: 543,
  },
  {
    id: 3,
    slug: "love-me-some-acid",
    source: "Championship",
    sourceIcon: "/recipeIcon/cat_crown.svg",
    title: "Love me some acid",
    description:
      "2018 Portugal Aeropress Champion shares a recipe to hero the acidy fruitiness of the coffee.",
    hasVideo: true,
    isCold: false,
    votes: 465,
  },
  {
    id: 4,
    slug: "tim-wendelboe",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "Tim Wendelboe",
    description:
      "A simple AeroPress recipe for a filter like coffee, as used in Tim Wendelboe cafe in Oslo, Norway.",
    hasVideo: true,
    isCold: false,
    votes: 386,
  },
  {
    id: 5,
    slug: "smooooothy",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "Smooooothy!",
    description: "Learn how to brew a sweet and balanced cup of coffee.",
    hasVideo: true,
    isCold: false,
    votes: 290,
  },
  {
    id: 6,
    slug: "aeropress-iced-latte",
    source: "From an Enthusiast",
    sourceIcon: "/recipeIcon/icon_enthusiast.svg",
    title: "AeroPress Iced Latte",
    description:
      "Dark chocolate, sandalwood and umami seaweed. Full bodied and gives a good kick!",
    hasVideo: true,
    isCold: true,
    votes: 261,
  },
  {
    id: 7,
    slug: "the-only-aeropress-recipe-youll-ever-need",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "The only AeroPress recipe you'll ever need",
    description:
      "The crew at The Coffee Compass offer us a simple, versatile and tasty AeroPress recipe.",
    hasVideo: true,
    isCold: false,
    votes: 239,
  },
  {
    id: 8,
    slug: "two-big-cups-one-brew",
    source: "From an Enthusiast",
    sourceIcon: "/recipeIcon/icon_enthusiast.svg",
    title: "Two Big Cups - One Brew",
    description:
      "AeroPress for 2! This recipe produces one large cup of coffee, or enough to share with a friend :)",
    hasVideo: true,
    isCold: false,
    votes: 173,
  },
  {
    id: 9,
    slug: "v60-style-aeropress-light-roast",
    source: "From an Enthusiast",
    sourceIcon: "/recipeIcon/icon_enthusiast.svg",
    title: "V60 Style Aeropress (light roast)",
    description:
      "For a V60 style brew with your AeroPress (the light roast version).",
    hasVideo: true,
    isCold: false,
    votes: 151,
  },
  {
    id: 10,
    slug: "aeropress-espresso",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "AeroPress Espresso",
    description:
      "A great recipe to use as a base for brewing 'espresso' type coffee on the Aeropress",
    hasVideo: true,
    isCold: false,
    votes: 131,
  },
  {
    id: 11,
    slug: "for-the-sweetest-cup",
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "For the sweetest cup",
    description: "Slow press for the sweetness. Bypass for the bright acidity.",
    hasVideo: false,
    isCold: false,
    votes: 125,
  },
];
