// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

import { recipeData } from "@/data/recipeData";

import { Status } from "./_components/Status";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Tag } from "./_components/Tag";

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

export default async function RecipeDetail({ params }: Props) {
  // 1、拿到路由参数 slug
  const { slug } = await params;

  // 2、查找对应的数据
  const recipe = recipeData.find((item) => item.slug === slug);

  // 3、类型收窄
  /* 
    find() 可能找不到数据，此时 recipe 是 undefined。
    先排除 undefined，TypeScript 才能把 recipe 从
    Recipe | undefined 收窄为 Recipe，后面才能安全访问属性。
  */
  if (!recipe) {
    // 没找到对应数据，显示 Next.js 的 404 页面
    notFound();
  }

  return (
    <div className="flex">
      <div className="px-12">
        {/* 标题、统计区域 */}
        <div className=" sticky top-0 bg-white py-8 mb-8 border-b border-gray-200">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            {/* 标题 */}
            <h2 className="font-display text-2xl">{recipe.title}</h2>

            {/* 标签 */}
            <div className="flex gap-3 font-sans text-sm ">
              <p className="text-fuchsia-400 px-2 py-0.5 border border-fuchsia-400 rounded">
                Upvote {recipe.meta.likes}
              </p>
              <p className="text-zinc-800 px-2 py-0.5 border border-zinc-800 rounded">
                Save
              </p>
            </div>
          </div>

          {/* 统计区域 */}
          <div className="flex gap-6 font-sans pt-4">
            <Status
              name={recipe.meta.source.name}
              icon={recipe.meta.source.icon}
            />

            <div className="flex items-center gap-1">
              <p>Creator:</p>
              <Status name={recipe.meta.creator.name} />
            </div>

            {recipe.isCold && (
              <div className="flex items-center gap-1">
                <Image
                  src="/recipeIcon/icon_cold.svg"
                  width={1}
                  height={1}
                  alt=""
                  className="size-3"
                />
                <p>This is a cold recipe</p>
              </div>
            )}

            <Status
              name={`${recipe.meta.saves} saves`}
              icon="/detail/bookmark.svg"
            />

            <Status
              name={`${recipe.meta.comments} comments`}
              icon="/detail/comments.svg"
            />

            <Status
              name={`Private notes(${recipe.meta.privateNotes})`}
              icon="/detail/private-notes.svg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* 内容区域 */}
          <div className="flex flex-col gap-4 pr-70">
            {recipe.content.map((item, index) => {
              switch (item.type) {
                // 段落
                case "paragraph":
                  return (
                    <p key={index} className="font-sans leading-loose">
                      {item.text}
                    </p>
                  );

                // 标题
                case "heading":
                  return (
                    <h3 key={index} className="font-display">
                      {item.text}
                    </h3>
                  );

                // 列表
                case "list":
                  return (
                    <ul key={index}>
                      {item.items.map((item) => (
                        <li key={item} className="font-sans leading-loose">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );

                // 视频
                case "video":
                  return (
                    <div
                      key={index}
                      className="w-full h-100 pr-40 bg-option-bg"
                    />
                  );

                default:
                  break;
              }
            })}
          </div>

          {/* 分割线 */}
          <div className="h-px w-full bg-gray-200 my-6" />

          {/* 步骤 */}
          <div className="flex flex-col gap-4">
            {recipe.steps.map((item) => (
              <div key={item.id}>
                <h4 className="font-display">step {item.id}</h4>
                <p className="font-sans leading-loose">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe overview */}
      <div className="w-95 shrink-0 border-l border-gray-200 pl-4 pr-12 flex flex-col gap-8">
        <p className="font-display py-6 border-b border-gray-200">
          Recipe overview
        </p>
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
    </div>
  );
}
