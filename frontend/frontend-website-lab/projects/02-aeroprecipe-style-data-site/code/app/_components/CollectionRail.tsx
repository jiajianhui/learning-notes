"use client";

// 滚动播放所需的 npm 包
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// 引入数据
import { collectionCards } from "@/data/collectionCards";

export function CollectionRail() {
  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
      }),
    ],
  );

  return (
    <div ref={emblaRef} className="overflow-hidden m-4 lg:my-6 lg:mx-12">
      {/* flex 默认有一个隐藏效果：align-items: stretch—— 子元素，高度默认会被拉到一样高 */}
      <div className="flex">
        {collectionCards.map((card) => (
          // 卡片要有固定宽度 / 最小宽度，否则 flex 子项会被压缩，无法滚动

          <div
            key={card.id}
            className="
              z-10 relative min-w-full md:min-w-xl mr-4 
              bg-card-bg p-12 flex items-center 
              cursor-pointer select-none pr-30 md:pr-46
               rounded-lg
            "
          >
            {/* 文字 */}
            <div>
              <h3 className="text-2xl font-display tracking-wide pb-4">
                {card.title}
              </h3>
              <p className="font-sans tracking-wide leading-6">
                {card.description}
              </p>
            </div>

            {/* 背景图；注意Tailwind 的“任意属性”不要有空格 */}
            <div
              className="
                z-0 absolute right-0 top-0 w-full h-full bg-no-repeat 
                [background-size:var(--mobile-image-size)] 
                [background-position:var(--mobile-image-position)]

                md:[background-size:var(--image-size)]
                md:[background-position:var(--image-position)]
              "
              style={
                {
                  backgroundImage: `url(${card.image})`,

                  // 定义 CSS 变量
                  "--image-size": card.imageSize,
                  "--mobile-image-size": card.mobileImageSize,
                  "--image-position": card.imagePosition,
                  "--mobile-image-position": card.mobileImagePosition,
                } as React.CSSProperties & Record<string, string>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
