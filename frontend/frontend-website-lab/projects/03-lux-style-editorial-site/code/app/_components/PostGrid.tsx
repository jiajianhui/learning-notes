import "./postGrid.css";
import { posts } from "../_data/posts";
import Link from "next/link";
export function PostGrid() {
  return (
    <div className="postGrid">
      {posts.map((post, index) => (
        <div key={index} className="postGridItem">
          <Link
            href={post.url}
            target="_blank"
            // Link 最终渲染为默认 inline 的 <a>；改为 block，使 w-full、h-full 生效并撑满卡片
            className={`group block relative overflow-hidden w-full h-full rounded-[40px] ${post.image ? "" : "bg-amber-200"}`}
          >
            {/* 标题 */}
            <h4 className="text-xl xl:text-3xl font-bold text-white absolute left-0 bottom-0 p-8 xl:p-14 z-20">
              {post.title}
            </h4>

            {/* 遮罩 */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-black/0 to-30% z-10" />

            {/* 图片 */}
            {post.image && (
              // lazy：接近可视区域时再加载；async：异步解码，尽量避免阻塞其他内容显示
              <img
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                src={post.image}
                loading="lazy"
                decoding="async"
                alt=""
              />
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
