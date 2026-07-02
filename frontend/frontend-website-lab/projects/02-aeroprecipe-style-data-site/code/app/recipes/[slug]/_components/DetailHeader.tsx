"use client";

// 引入类型
import { Recipe } from "@/data/types/recipe/recipe";

// 引入组件
import { Status } from "./Status";
import Link from "next/link";

type DetailHeaderProps = {
  recipe: Recipe;
};

export function DetailHeader({ recipe }: DetailHeaderProps) {
  return (
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
        <button
          className="cursor-pointer"
          onClick={() => {
            document
              .querySelector("#comments")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Status
            name={`${recipe.meta.comments} comments`}
            icon="/detail/comments.svg"
          />
        </button>
        <button
          className="cursor-pointer"
          onClick={() => {
            document
              .querySelector("#comments")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Status
            name={`Private notes(${recipe.meta.privateNotes})`}
            icon="/detail/private-notes.svg"
          />
        </button>
      </div>
    </div>
  );
}
