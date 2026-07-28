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

      {/* 遮罩 */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/0 to-60% z-10" />

      {/* 标题 */}
      <div
        data-swiper-parallax="-600"
        className="flex flex-col gap-4 items-start justify-center h-full relative z-20 px-6 md:px-20 lg:px-40 text-white"
      >
        <h2 className="max-w-3xl xl:max-w-4xl text-4xl md:text-5xl lg:text-7xl font-black">
          {title}
        </h2>

        {subtitle && <p className="max-w-lg md:text-xl">{subtitle}</p>}
        <Link
          className="md:text-xl underline underline-offset-4 decoration-1"
          href={url}
          target="_blank"
        >
          Read more
        </Link>
      </div>
    </div>
  );
}
