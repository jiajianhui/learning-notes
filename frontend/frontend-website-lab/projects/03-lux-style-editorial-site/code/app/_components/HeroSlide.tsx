import Image from "next/image";
import Link from "next/link";


// 其他文件需要
export type HeroSlideProps = {
  image: string;
  title: string;
  subtitle?: string;
  url: string;
};

export function HeroSlide({ image, title, subtitle, url }: HeroSlideProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 封面；fill 让图片变为绝对定位，方便文字叠在上面 */}
      <Image className="object-cover" src={image} fill alt="" />

      {/* 标题 */}
      <div className="flex flex-col gap-4 items-start justify-center h-full relative px-40 text-white">
        <h2 className="max-w-4xl text-7xl font-black">{title}</h2>

        {subtitle && (
          <p className="max-w-lg text-xl">{subtitle}</p>
        )}
        <Link
          className="text-xl underline underline-offset-4 decoration-1"
          href={url}
          target="_blank"
        >
          Read more
        </Link>
      </div>
    </div>
  );
}
