import "./postGrid.css";
import { posts } from "../_data/posts";
import Image from "next/image";
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
            <h4 className="text-3xl font-bold text-white absolute left-0 bottom-0 p-14 z-20">
              {post.title}
            </h4>

            {/* 遮罩 */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-black/0 to-30% z-10" />

            {/* 图片 */}
            {post.image && (
              // fill —— 底层类似 position: absolute; inset: 0
              <Image
                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                src={post.image}
                fill
                alt=""
              />
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
