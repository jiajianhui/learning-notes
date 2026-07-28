"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function SiteHeader() {
  // Hook 必须放在函数组件内部，并且位于组件顶层：
  const [hidden, setHidden] = useState(false);

  // 记录上一次滚动的位置
  const preScroll = useRef(0);

  useEffect(() => {
    const isHidden = () => {
      if (window.scrollY <= 200) {
        setHidden(false);
      } else if (window.scrollY > preScroll.current) {
        setHidden(true);
      } else if (window.scrollY < preScroll.current) {
        setHidden(false);
      }

      // 滚动结束后记录本次位置
      preScroll.current = window.scrollY;
    };

    window.addEventListener("scroll", isHidden);

    return () => {
      window.removeEventListener("scroll", isHidden);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 z-30 w-screen py-6 px-6 xl:px-40 transition-all duration-500 ease-in-out ${hidden ? "-translate-y-30" : "translate-y-0"}`}
    >
      <div className="flex justify-between items-center px-5 xl:px-7 h-14 xl:h-16 rounded-2xl bg-white/50 backdrop-blur-xl">
        <button className="flex items-center gap-2.5 text-sm">
          <Image
            src="/header/menu.svg"
            width={14}
            height={14}
            className="size-5 xl:size-3.5"
            alt="menu"
          />
          <p className="hidden md:block">MENU</p>
        </button>

        <Image
          src="/header/lux-logo.png"
          width={320}
          height={320}
          className="w-auto h-5 xl:h-7.5"
          alt="logo"
        />
        <button className="flex items-center gap-2.5 text-sm">
          <Image
            src="/header/search.svg"
            width={14}
            height={14}
            className="size-5 xl:size-3.5"
            alt="search"
          />
          <p className="hidden md:block">SEARCH</p>
        </button>
      </div>
    </div>
  );
}
