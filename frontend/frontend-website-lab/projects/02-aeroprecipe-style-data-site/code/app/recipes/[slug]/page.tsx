// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

import { recipes } from "@/data/recipeData";

import { Status } from "./_components/Status";

export default async function RecipeDetail({ params }: Props) {
  const { slug } = await params;

  const recipe = recipes[0]
  return (
    <div className="px-12">
      {/* 标题、统计区域 */}
      <div className=" sticky top-0 bg-white py-8 mb-8 border-b border-gray-200">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          {/* <h1>detail {slug}</h1> */}

          {/* 标题 */}
          <h2 className="font-display text-2xl">{recipe.title}</h2>

          {/* 标签 */}
          <div className="flex gap-3 font-sans text-sm ">
            <p className="text-fuchsia-400 px-2 py-0.5 border border-fuchsia-400 rounded">
              Upvote (1116)
            </p>
            <p className="text-zinc-800 px-2 py-0.5 border border-zinc-800 rounded">
              Save
            </p>
          </div>
        </div>

        {/* 统计区域 */}
        <div className="flex gap-12 font-sans pt-4">
          <Status name={recipe.source.name} icon={recipe.source.icon} />

          <div className="flex items-center gap-1">
            <p>Creator:</p>
            <Status name={recipe.creator.name} />
          </div>

          <Status
            name={`${recipe.stats.saves} saves`}
            icon={recipe.source.icon}
          />

          <Status
            name={`${recipe.stats.comments} comments`}
            icon={recipe.source.icon}
          />

          <Status name="Private notes (10)" icon={recipe.source.icon} />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-col gap-8">
        {/* 介绍 */}
        <div className="flex flex-col gap-4 pr-70">
          {recipe.introduction.map((item) => (
            <p key={item} className="font-sans leading-loose">
              {item}
            </p>
          ))}
        </div>

        {/* notes */}
        <div className="flex flex-col gap-4 pr-70">
          <h4 className="font-display">Quick notes:</h4>
          {recipe.notes.map((item) => (
            <p key={item} className="font-sans leading-loose">
              {item}
            </p>
          ))}
        </div>

        {/* video */}
        <div className="pr-70">
          <div className="w-full h-100 pr-40 bg-option-bg" />
        </div>

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
