"use client";

import Image from "next/image";

// swiper 组件
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard } from "swiper/modules";

// swiper 样式
import "swiper/css";
import "swiper/css/navigation";
import { useRef } from "react";

// 组件
import { HeroSlide } from "./HeroSlide";

export function HeroSlider() {
  // 箭头
  const pre = useRef<HTMLButtonElement>(null);
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
          <HeroSlide
            image="/hero-slides/02-iphone-17e.jpg"
            title="iPhone 17e: An Almost Perfect Entry"
            url="https://www.google.com"
          />
        </SwiperSlide>

        <SwiperSlide>
          <HeroSlide
            image="/hero-slides/05-iphone-16-pro-review.png"
            title="The iPhone 16 Pro Camera Review: Control"
            subtitle="For the first “Desert Titanium” iPhone, we took over 1000 photos and videos in the desert. Take a deep dive into what’s new — and why it’s close to the last of its kind."
            url="https://www.google.com"
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
