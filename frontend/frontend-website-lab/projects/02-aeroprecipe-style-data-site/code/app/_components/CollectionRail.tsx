"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";


import Image from "next/image";
import xx from "@/public/WAC.svg";

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
        {[1, 2, 3, 4, 5, 6].map((item) => (
          // 卡片要有固定宽度 / 最小宽度，否则 flex 子项会被压缩，无法滚动
          <div
            key={item}
            className="min-w-xl mr-4 bg-gray-100 p-12 flex items-center cursor-pointer select-none"
          >

            {/* 文字 */}
            <div>
              <h3 className="text-2xl font-display tracking-wide pb-4">
                Championship Recipes
              </h3>
              <p className="font-sans tracking-wide leading-6">
                Brew like the best - here's a list of tried and true recipes
                from AeroPress Champions.
              </p>
            </div>

            {/* 图片 */}
            <Image src={xx} alt="" className="size-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
