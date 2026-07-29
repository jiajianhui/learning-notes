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

  // 打开 Menu
  const [showMenu, setShowMenu] = useState(false);

  // 打开 Menu 后禁用滚动
  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  return (
    <>
      {/* header */}
      <div
        className={`fixed top-0 z-30 w-screen py-6 px-6 md:px-20 lg:px-40 transition-transform duration-500 ease-in-out ${hidden ? "-translate-y-30" : "translate-y-0"}`}
      >
        <div className="flex justify-between items-center px-5 xl:px-7 h-14 xl:h-16 rounded-2xl bg-white/50 backdrop-blur-xl">
          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-2.5 text-sm"
          >
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

      {/* 抽屉组件 */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-2xl h-screen z-50 bg-white transition-transform duration-300 ease-in ${showMenu ? "" : "-translate-x-full"}`}
      >
        <button onClick={() => setShowMenu(false)}>close</button>
      </div>

      {/* 遮罩 */}
      <div
        className={`fixed inset-0 z-40 w-screen h-screen bg-black/50 transition-opacity ${showMenu ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
    </>
  );
}
