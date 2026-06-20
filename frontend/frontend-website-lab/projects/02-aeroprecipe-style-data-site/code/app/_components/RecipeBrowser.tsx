import Image from "next/image";

// 引入图标
import cold from "@/public/recipeIcon/icon_cold.svg";
import video from "@/public/recipeIcon/icon_video.svg";
import good from "@/public/recipeIcon/icon_like.svg"

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
const filterGroups: FilterGroup[] = [
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
const recipeCards = [
  {
    id: 1,
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "James Hoffmann's Ultimate AeroPress Recipe",
    description: "James Hoffmann's Ultimate AeroPress Recipe",
    hasVideo: true,
    isCold: false,
    votes: 1116,
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "Smooooothy!",
    description: "Learn how to brew a sweet and balanced cup of coffee.",
    hasVideo: true,
    isCold: false,
    votes: 290,
  },
  {
    id: 7,
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
    id: 8,
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
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
    source: "From a Barista",
    sourceIcon: "/recipeIcon/noun_tamper.svg",
    title: "For the sweetest cup",
    description: "Slow press for the sweetness. Bypass for the bright acidity.",
    hasVideo: false,
    isCold: false,
    votes: 125,
  },
];

export function RecipeBrowser() {
  return (
    <div>
      <div className="flex  border-t border-gray-200">
        <div>
          {/* 标题栏 */}
          <div className="flex justify-between text-sm sticky top-0 backdrop-blur-3xl font-sans px-12 py-6">
            <p>AeroPress® recipes! Viewing: all recipes (360)</p>
            <p className="font-display">Sort by:</p>
          </div>

          {/* 网格卡片 */}
          <div className="px-12 grid gap-8 grid-cols-3">
            {recipeCards.map((item) => (
              <div
                key={item.id}
                className="font-sans py-2 border-t border-gray-200 hover:border-gray-600 cursor-pointer"
              >
                {/* 小字部分 */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2 items-center">
                    <Image
                      src={item.sourceIcon}
                      width={1}
                      height={1}
                      alt=""
                      className="size-4"
                    />
                    <p className="w-full">{item.source}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    {item.hasVideo && (
                      <Image src={video} alt="" className="size-3.5" />
                    )}

                    {item.isCold && (
                      <Image src={cold} alt="" className="size-3.5" />
                    )}

                    <Image src={good} alt="" className="size-4 -mr-1.5" />
                    <p>{item.votes}</p>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-display py-3">{item.title}</h3>
                {/* 描述 */}
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 筛选栏——sticky + h-screen + overflow-y-auto 实现吸顶滚动 */}
        <div className="max-w-100 h-screen overflow-y-auto bg-card-bg sticky top-0  border-l border-gray-200">
          <div className="p-8 flex flex-col gap-4">
            <p className=" font-display">Refine your recipe search</p>

            <div className="h-px bg-gray-200 w-full"></div>

            <div>
              <p className="text-lg font-display">My recipes only</p>
              <p className="font-sans">
                Show recipes you&apos;ve created, public and private
              </p>
            </div>

            {/* 数据渲染 */}
            {filterGroups.map((group) => (
              <div key={group.title}>
                {/* 标题 */}
                <p className="text-lg font-display">{group.title}</p>

                {/* 选项 */}
                <div className={`flex ${group.layout} gap-2 py-1`}>
                  {group.options.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 font-sans bg-option-bg px-2 py-2 ${group.optionWidth}`}
                    >
                      {/* && 是短路渲染：左边有值时才渲染右边的 Image */}
                      {item.icon && (
                        <Image
                          src={item.icon}
                          width={1}
                          height={1}
                          alt=""
                          className="size-4"
                        />
                      )}

                      <p>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
