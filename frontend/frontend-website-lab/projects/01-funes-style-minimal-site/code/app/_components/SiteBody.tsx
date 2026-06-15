"use client";

// 选项
const options: string[] = [
  "all",
  "book",
  "album",
  "podcast",
  "quote",
  "game",
  "drama",
];

// 对象映射表，一堆 key 对应同一种 value用 Record；普通对象，每个字段含义明确：用 type / interface
// Record 是 TypeScript 里的一个工具类型。它的作用是：规定一个对象的 key 是什么类型，value 是什么类型。
const subOptions: Record<string, string[]> = {
  all: [],
  book: ["to-read", "reading", "have-read"],
  album: ["to-listen", "listening", "have-listened"],
  podcast: ["to-listen", "listening", "have-listened"],
  quote: [],
  game: ["to-play", "playing", "have-played"],
  drama: ["to-watch", "watching", "have-watched"],
};

// 引入数据
import { works } from "@/data/work";

// 状态
// 在page.tsx中不用"use client";将用到"use client"的页面封装为组件，然后引入到page中使用
// page.tsx 保持 Server Component 的核心好处是：少发 JS、首屏更快、SEO 更好、服务端拿数据更方便、更安全。
import { useState } from "react";

export function SiteBody() {

    // 一级筛选、二级筛选
      const [currentType, setCurrentType] = useState("all");
      const [currentStatus, setCurrentStatus] = useState("");
    
      // 数据筛选；filter() 会返回一个新数组，条件是 true  → 这一项留下、条件是 false → 这一项不要
      const filterData = works.filter((data) => {
        // 1、判断类型，一级分类
        const typeMatched = currentType === "all" || currentType === data.type;
    
        // 2、判断状态，二级分类
        const statusMatched = currentStatus === "" || currentStatus === data.status;
    
        // 3、返回
        return typeMatched && statusMatched;
      });
    
      // 一级筛选按钮，设置 type，重置status
      function typeClick(type: string) {
        setCurrentType(type)
        setCurrentStatus("")
      }
    return (
        // <>...</> 是 React Fragment 的简写。作用是：包住多个 JSX 元素，不会生成真实的 DOM 标签
      <>
        {/* 筛选栏 */}
        <div className="h-10 my-4">
          {/* 一级筛选 */}
          <div className="flex gap-1 px-4">
            {options.map((item) => (
              <button
                key={item}
                onClick={() => typeClick(item)}
                className={`px-1 cursor-pointer ${
                  currentType === item
                    ? "bg-zinc-500 text-white"
                    : "hover:bg-zinc-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* 二级筛选 */}
          <div className="flex gap-1 px-4">
            {subOptions[currentType].map((item) => (
              <button
                key={item}
                onClick={() => setCurrentStatus(item)}
                className={`px-1 cursor-pointer ${
                  currentStatus === item
                    ? "bg-zinc-500 text-white"
                    : "hover:bg-zinc-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 数据列表；flex-1 撑开剩余空间，父元素必须先有一个“可用高度” */}
        <div className="flex flex-1 flex-col">
          {filterData.map((item) => (
            // 列表项
            <div
              key={item.id}
              className="grid gap-2 grid-cols-[1fr_1fr] py-6 md:grid-cols-[6rem_15rem_1fr_15rem] md:py-1 px-4 hover:bg-gray-100"
            >
              <p>{item.code}</p>
              <p>{item.author}</p>
              {/* col-span-2 —— 元素横向占 2 列 */}
              <p className="col-span-2 md:col-span-1">{item.title}</p>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </>
    );
}
