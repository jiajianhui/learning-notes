// 动态标签页标题
import type { Metadata } from "next";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = recipeData.find((item) => item.slug === slug);

  return {
    title: recipe?.title
      ? `${recipe.title} | AeroPrecipe by ${recipe.meta.creator.name}`
      : "Recipe",
  };
}

// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// 引入类型
import { recipeData } from "@/data/recipeData";

// 引入组件
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Status } from "./_components/Status";
import { RecipeOverview } from "./_components/RecipeOverview";
import { Comments } from "./_components/Comments";

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
      <div className="px-12 border-r border-gray-200">
        {/* 标题、统计区域 */}
        <div className=" sticky top-0 z-20 bg-white/70 backdrop-blur py-8 mb-8 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 items-center justify-between">
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
          <div className="flex flex-wrap gap-6 font-sans pt-4">
            {/* 路由跳转 */}
            <Link href="/">
              <Status
                name={recipe.meta.source.name}
                icon={recipe.meta.source.icon}
              />
            </Link>

            <div className="flex items-center gap-1">
              <p>Creator:</p>
              {/* 外部链接 */}
              <a href="https://www.jianhui.xyz" target="_blank">
                <Status
                  name={recipe.meta.creator.name}
                  icon="/detail/creator-link.svg"
                  iconPosition="right"
                />
              </a>
            </div>

            {recipe.isCold && (
              // JSX 给组件传参时，字符串可以直接写 参数="文本"，其他 JS 值都要写成参数={值}。
              <Status
                name="This is a cold recipe"
                icon="/detail/cold.svg"
                underline={false}
              />
            )}

            {/* 操作按钮 */}
            <button className="cursor-pointer">
              <Status
                name={`${recipe.meta.saves} saves`}
                icon="/detail/bookmark.svg"
              />
            </button>

            {/* 滚动到指定位置 */}
            <a href="#comments">
              <Status
                name={`${recipe.meta.comments} comments`}
                icon="/detail/comments.svg"
              />
            </a>
            <a href="#comments">
              <Status
                name={`Private notes(${recipe.meta.privateNotes})`}
                icon="/detail/private-notes.svg"
              />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* 内容区域 */}
          <div className="flex flex-col gap-4 pr-0 lg:pr-20 xl:pr-40 2xl:pr-70">
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
          <div className="h-px w-full bg-gray-200 my-0 md:my-3 lg:my-6" />

          {/* 移动端下的 Recipe overview */}
          <div className="block lg:hidden">
            <RecipeOverview recipe={recipe} title="Recipe details:" />
          </div>

          {/* 步骤 */}
          <div className="flex flex-col gap-4">
            {recipe.steps.map((item) => (
              <div key={item.id}>
                <h4 className="font-display">step {item.id}</h4>
                <p className="font-sans leading-loose">{item.text}</p>
              </div>
            ))}
          </div>

          {/* 分割线 */}
          <div className="h-px w-full bg-gray-200 my-0 md:my-3 lg:my-6" />

          {/* 评论区 */}
          <div id="comments">
            <Comments />
          </div>
        </div>
      </div>

      {/* 电脑端下的 Recipe overview */}
      <div className="sticky top-0 self-start w-95 shrink-0 pl-4 pb-12 pr-12 hidden lg:block">
        <RecipeOverview recipe={recipe} title="Recipe overview" />
      </div>
    </div>
  );
}
