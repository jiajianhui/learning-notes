// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

import { recipes } from "@/data/recipeData";

import { Status } from "./_components/Status";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function RecipeDetail({ params }: Props) {
  // 1、拿到路由参数 slug
  const { slug } = await params;

  // 2、查找对应的数据
  const recipe = recipes.find((item) => item.slug === slug);

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
            name="Private notes (10)"
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
  );
}
