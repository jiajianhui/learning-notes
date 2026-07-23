"use client"

import Image from "next/image";

// swiper 组件
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard } from "swiper/modules";

// swiper 样式
import "swiper/css"
import "swiper/css/navigation"
import { useRef } from "react";



export default function Home() {

  // 箭头
  const pre = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null);

  return (
    <section className="w-screen h-screen relative">
      {/* 箭头 */}
      <div className="absolute right-0 z-10 flex flex-col gap-4 h-screen justify-center pr-40">
        <button
          ref={next}
          className="[&.swiper-button-disabled]:opacity-40 cursor-pointer"
          aria-label="下一张"
        >
          <Image
            className="size-12"
            src="/icons/next.svg"
            alt=""
            width={1}
            height={1}
          />
        </button>

        <button
          ref={pre}
          className="[&.swiper-button-disabled]:opacity-40 cursor-pointer"
          aria-label="上一张"
        >
          <Image
            className="size-12"
            src="/icons/pre.svg"
            alt=""
            width={1}
            height={1}
          />
        </button>
      </div>

      {/* 轮播 */}
      <Swiper
        slidesPerView={1}
        loop={false}
        modules={[Autoplay, Navigation, Keyboard]}
        autoplay={{ delay: 3000 }}
        navigation={{}}
        // 用 ref 把自己写的按钮交给 Swiper 控制
        onBeforeInit={(swiper) => {
          const navigation = swiper.params.navigation;

          if (navigation && typeof navigation !== "boolean") {
            navigation.prevEl = pre.current;
            navigation.nextEl = next.current;
          }
        }}
        keyboard={{ enabled: true }}
        className="w-screen h-screen relative"
      >
        <SwiperSlide>
          {/* 让图片变为绝对定位，方便文字叠在上面 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 封面 */}
            <Image
              className="object-cover"
              src="/hero-slides/02-iphone-17e.jpg"
              fill
              alt=""
            />

            {/* 标题 */}
            <div className="flex flex-col gap-4 items-start justify-center h-full relative px-40 text-white">
              <h2 className="max-w-4xl text-7xl font-black">
                iPhone 17e: An Almost Perfect Entry
              </h2>
              <p className="text-xl underline underline-offset-4 decoration-1">
                Read more
              </p>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="absolute inset-0 overflow-hidden">
            <Image
              className="object-cover"
              src="/hero-slides/05-iphone-16-pro-review.png"
              fill
              alt=""
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
