"use client";

// 滚动播放所需的 npm 包
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import Image from "next/image";

// 引入数据
import { collectionCards } from "../datas/collectionCards";

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
    <div ref={emblaRef} className="overflow-hidden my-6 mx-12">
      <div className="flex">
        {collectionCards.map((card) => (
          // 卡片要有固定宽度 / 最小宽度，否则 flex 子项会被压缩，无法滚动
          <div
            key={card.id}
            className="min-w-xl mr-4 bg-gray-100 p-12 flex items-center cursor-pointer select-none"
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

            {/* 图片 */}
            <Image
              src={card.image}
              alt={card.imageAlt}
              width={card.imageWidth}
              height={card.imageHeight}
              className={card.imageClassName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
