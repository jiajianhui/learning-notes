"use client";

import Image from "next/image";
import { useRef } from "react";

// swiper 组件
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Keyboard, Parallax } from "swiper/modules";

// swiper 样式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/parallax";

// 组件
import { HeroSlide } from "./HeroSlide";
import { HeroScrollIndicator } from "./HeroScrollIndicator";

// 数据
import { sliderItems } from "../_data/slider";

export function HeroSlider() {
  // 箭头
  const pre = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);

  return (
    <section className="w-screen h-screen relative">
      {/* 箭头、鼠标指示 */}
      <div className="absolute right-0 z-10 flex flex-col gap-4 h-screen justify-center items-center mr-40">
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

        <HeroScrollIndicator />
      </div>

      {/* 轮播 */}
      <Swiper
        slidesPerView={1}
        loop={false}
        modules={[A11y, Autoplay, Navigation, Keyboard, Parallax]}
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
        speed={800}
        parallax
        className="w-screen h-screen relative"
      >
        {sliderItems.map((item, index) => (
          <SwiperSlide key={index}>
            <HeroSlide
              image={item.image}
              title={item.title}
              subtitle={item.subtitle}
              url={item.url}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
