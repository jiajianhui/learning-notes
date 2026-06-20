import Image from "next/image";
import xx from "@/public/recipeIcon/cat_crown.svg";
import yy from "@/public/recipeIcon/icon_video.svg";

// 筛选数据
const filterGroups = [
  {
    title: "Category",
    layout: "flex-col",
    optionWidth: "w-full",
    options: [
      { label: "Championship", icon: "/recipeIcon/cat_crown.svg" },
      { label: "Experimental" },
      { label: "From a Barista", icon: "/recipeIcon/noun_tamper.svg" },
      { label: "From an Enthusiast", icon: "/recipeIcon/icon_enthusiast.svg" },
    ],
  },
  {
    title: "Orientation",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [{ label: "Standard" }, { label: "Inverted" }],
  },
  {
    title: "Filter type",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [{ label: "Paper" }, { label: "Metal" }],
  },
  {
    title: "Brew time (minutes)",
    layout: "flex-row",
    optionWidth: "w-full",
    options: [{ label: "<2" }, { label: "2-5" }, { label: "5+" }],
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
      { label: "Has Video", icon: "/recipeIcon/icon_video.svg" },
      { label: "Espresso Style" },
      { label: "Milk" },
      { label: "Iced" },
      { label: "Low dose" },
      { label: "Two cups" },
    ],
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
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="font-sans py-2 border-t border-gray-200"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2 items-center">
                    <Image src={xx} alt="" className="size-3" />
                    <p className="w-full">From a Barista</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Image src={yy} alt="" className="size-3" />
                    <p>1116</p>
                  </div>
                </div>
                <h3 className="text-lg font-display py-3">
                  James Hoffmann's Ultimate AeroPress Recipe
                </h3>
                <p>James Hoffmann's Ultimate AeroPress Recipe</p>
              </div>
            ))}
          </div>
        </div>

        {/* 筛选栏——sticky + h-screen + overflow-y-auto 实现吸顶滚动 */}
        <div className="max-w-100 h-screen overflow-y-auto bg-amber-50 sticky top-0  border-l border-gray-200">
          <div className="p-8 flex flex-col gap-4">
            <p className=" font-display">Refine your recipe search</p>

            <div className="h-px bg-gray-200 w-full"></div>

            <div>
              <p className="text-lg font-display">My recipes only</p>
              <p className="font-sans">
                Show recipes you've created, public and private
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
                      className={`flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 ${group.optionWidth}`}
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
