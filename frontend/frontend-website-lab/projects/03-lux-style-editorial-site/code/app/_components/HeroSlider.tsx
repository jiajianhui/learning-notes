"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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

  // 指示条
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-screen h-screen relative">
      {/* 箭头、鼠标指示 */}
      <div className="absolute right-0 z-10 h-screen w-[50px] flex justify-center items-center mr-6 md:mr-20 lg:mr-40">
        <div className="hidden md:flex flex-col gap-4">
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

        <HeroScrollIndicator />
      </div>

      {/* 指示条 */}
      <div className="absolute left-0 bottom-10 z-10 flex md:hidden gap-2 px-6">
        {sliderItems.map((_, index) => (
          <div
            key={index}
            className={`w-5 h-0.5 bg-white ${activeIndex === index ? "" : "opacity-45"}`}
          />
        ))}
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
        // 切换回调
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
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
