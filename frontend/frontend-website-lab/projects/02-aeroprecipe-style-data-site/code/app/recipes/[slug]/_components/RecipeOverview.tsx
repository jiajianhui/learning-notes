import Image from "next/image"

// 映射表
// 过滤映射表
const filterMap = {
  paper: {
    name: "Paper Filter",
    icon: "/recipeIcon/icon_filter_paper.svg",
  },
  metal: {
    name: "Metal Filter",
    icon: "/recipeIcon/icon_filter_metal.svg",
  },
};

// 冲煮方式映射表
const methodMap = {
  standard: {
    name: "standard",
    icon: "/recipeIcon/icon_aeropress_standard.svg",
  },
  inverted: {
    name: "inverted",
    icon: "/recipeIcon/icon_aeropress_inverted.svg",
  },
};

// 时间计算函数
function getBrewTime(time: number) {
  const minutes = Math.floor(time / 60); // Math.floor —— 向下取整
  const seconds = time % 60;

  // padStart 是 String 的方法，用来在字符串前面补内容，第一个参数是目标长度，第二个参数是用来填充的内容。
  const timeLabel = `${minutes}:${String(seconds).padStart(2, "0")}`;

  let icon = "";

  if (time < 120) {
    icon = "/recipeIcon/icon_timer_fast.svg";
  } else if (time <= 300) {
    icon = "/recipeIcon/icon_timer_medium.svg";
  } else {
    icon = "/recipeIcon/icon_timer_slow.svg";
  }

  return {
    timeLabel,
    icon,
  };
}

// 引入类型
import { Recipe } from "@/data/types/recipe/recipe";

// 引入组件
import { Tag } from "./Tag";


type RecipeOverviewProps = {
    recipe: Recipe;
    title: string
};

export function RecipeOverview({recipe, title}: RecipeOverviewProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <p className="font-display py-0 lg:py-6 border-b border-transparent lg:border-gray-200">{title}</p>
      <div className="flex flex-wrap gap-2">
        <Tag
          icon={methodMap[recipe.overview.brew.method].icon}
          name={methodMap[recipe.overview.brew.method].name}
        />

        <Tag
          icon={getBrewTime(recipe.overview.brew.time).icon}
          name={getBrewTime(recipe.overview.brew.time).timeLabel}
        />
        <Tag
          icon={filterMap[recipe.overview.brew.filter].icon}
          name={filterMap[recipe.overview.brew.filter].name}
        />
      </div>

      {/* Coffee */}
      <div className="flex flex-col gap-2">
        <p className=" font-display">Coffee:</p>

        <div className="flex flex-wrap gap-2">
          <Tag
            icon="/detail/scale.svg"
            name={`${recipe.overview.coffee.amount}${recipe.overview.coffee.unit}`}
          />
          {recipe.overview.coffee.description && (
            <Tag
              icon="/detail/coffee-bean.svg"
              name={recipe.overview.coffee.description}
            />
          )}
        </div>
      </div>

      {/* Grind */}
      <div className="flex flex-col gap-2">
        <p className=" font-display">Grind Settings:</p>
        <div className="flex flex-wrap gap-2">
          <Tag icon="/detail/grind.svg" name={recipe.overview.grind.level} />
          {recipe.overview.grind.grinder && (
            <div className="font-sans text-sm bg-option-bg w-full rounded-sm">
              <div className="flex flex-col gap-3 p-6 rounded-sm">
                {`${recipe.overview.grind.grinder.setting} clicks on a Comandante ${recipe.overview.grind.grinder.model}`}
                <div className="group flex items-center justify-center gap-2 py-0.5 border border-black rounded-sm bg-option-bg hover:bg-black text-black hover:text-white">
                  <Image
                    src="/detail/change-grinder.svg"
                    width={1}
                    height={1}
                    alt=""
                    className="size-3 group-hover:invert"
                  />
                  <p>Change grinder</p>
                </div>
              </div>
              <p className="p-6 border-t border-gray-300">
                Powered by{" "}
                <span className="font-display underline">Beean Coffee</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Water */}
      <div className="flex flex-col gap-2">
        <p className=" font-display">Water:</p>
        <div className="flex flex-wrap gap-2">
          <Tag
            icon="/detail/temperature.svg"
            name={`${recipe.overview.water.temperature}°C`}
          />
          <Tag
            icon="/detail/water.svg"
            name={`${recipe.overview.water.amount}g`}
          />
        </div>
      </div>

      {/* Equipment */}
      <div className="flex flex-col gap-2">
        <p className=" font-display">Equipment:</p>
        <div className="flex flex-col gap-2">
          {recipe.overview.equipment.map((item, index) => (
            <a href={item.url} key={index} target="_blank">
              <div className="flex items-center gap-2 bg-option-bg rounded-sm px-5 py-3">
                {/* 显示不同尺寸、比例的图片 */}
                <div className="relative size-10">
                  <Image
                    src={item.image}
                    fill
                    alt=""
                    className="object-contain"
                  />
                </div>

                <p className="font-sans text-sm w-full pl-2">{item.name}</p>

                <Image
                  src="/detail/external-link.svg"
                  alt=""
                  width={1}
                  height={1}
                  className="size-4.5"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}