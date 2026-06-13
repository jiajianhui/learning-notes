"use client";

// 选项
const options: string[] = ["all", "book", "album", "podcast", "quote", "game", "drama"];

// 对象映射表，一堆 key 对应同一种 value用 Record；普通对象，每个字段含义明确：用 type / interface
// Record 是 TypeScript 里的一个工具类型。它的作用是：规定一个对象的 key 是什么类型，value 是什么类型。
const subOptions: Record<string, string[]> = {
  all: ["todo", "doing", "done", "random"],
  book: ["to-read", "reading", "have-read"],
  album: ["to-watch", "watching", "have-watched"],
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

export default function Home() {
  const [option, setOption] = useState("all");

  return (
    <div className="flex flex-col p-2 pt-4 font-mono text-sm">
      {/* 主选项 */}
      <div className="flex flex-1 gap-1 px-2">
        {options.map((item) => (
          <p
            key={item}
            onClick={() => setOption(item)}
            className={`px-1 cursor-pointer ${
              option === item
                ? "bg-zinc-600 text-white"
                : "hover:bg-zinc-300 hover:text-white"
            }`}
          >
            {item}
          </p>
        ))}
      </div>

      {/* 副选项 */}
      <div className="flex flex-1 gap-1 px-2">
        {subOptions[option].map((item) => (
          <p key={item} className="px-1 hover:bg-zinc-300 hover:text-white cursor-pointer">
            {item}
          </p>
        ))}
      </div>

      {/* 数据列表 */}
      <div>
        <div className="flex flex-col pt-5">
          {works.map((item) => (
            // 列表项
            <div key={item.id} className="flex py-1 px-2 hover:bg-gray-100">
              <p className="min-w-30">{item.code}</p>
              <p className="min-w-96">{item.author}</p>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
