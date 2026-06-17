import Image from "next/image";

// 引入图片
import search from "@/public/icons/search.svg"
import more from "@/public/icons/more-horizontal.svg";

export function SiteHeader() {
  const navTitle: string[] = [
    "Feeling lucky?",
    "Activity",
    "Add a recipe",
    "Get the app!",
  ];

  return (
    <header className="flex justify-between items-center font-display px-12 py-4 border-b border-zinc-300">
      {/* 标题 */}
      <h1 className="flex-1 text-lg">AeroPrecipe.</h1>

      <div className="flex items-center gap-6">
        {/* 导航 */}
        {navTitle.map((item) => (
          <p key={item}>{item}</p>
        ))}

        <div className="w-px h-10 bg-zinc-300" />

        {/* 登陆、搜索 */}
        <button>Sign in</button>
        <button className="px-4 py-2 rounded-sm bg-zinc-950 text-white">
          Join
        </button>

        <Image src={search} alt="search" />
        <Image src={more} alt="more" />
      </div>
    </header>
  );
}
