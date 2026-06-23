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
    <div ref={emblaRef} className="overflow-hidden m-4 lg:mx-12">
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

            {/* 动态设置背景图片、尺寸和位置： 
                style 根据当前 card 数据动态写入背景图和 CSS 变量， 
                Tailwind 在不同断点读取对应变量并应用样式。 
            */}
            <div
              className="
                z-0 absolute right-0 top-0 w-full h-full bg-no-repeat 

                bg-size-(--mobile-image-size)
                bg-position-(--mobile-image-position)
                md:bg-size-(--image-size)
                md:bg-position-(--image-position)
              "
              style={
                {
                  // 动态设置当前卡片的背景图片
                  backgroundImage: `url(${card.image})`,

                  // 桌面端背景图尺寸和位置
                  "--image-size": card.imageSize,
                  "--image-position": card.imagePosition,

                  // 移动端背景图尺寸和位置
                  "--mobile-image-size": card.mobileImageSize,
                  "--mobile-image-position": card.mobileImagePosition,
                } as React.CSSProperties & Record<string, string>
                // 类型断言，这个对象既包含标准 React CSS 属性，也允许包含自定义 CSS 变量。
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
