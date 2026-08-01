"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { apps } from "../_data/apps";
import { sociallinks } from "../_data/sociallinks";

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
        <div className="siteHeader flex justify-between items-center px-5 xl:px-7 h-14 xl:h-16 rounded-2xl bg-white/50 backdrop-blur-xl shadow-sm">
          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-2.5 text-sm cursor-pointer"
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

          <Link href="/">
            <Image
              src="/header/lux-logo.png"
              width={1359}
              height={407}
              className="w-auto h-5 xl:h-7.5"
              alt="logo"
            />
          </Link>

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
        className={`fixed left-0 top-0 bottom-0 flex flex-col w-screen lg:w-2xl h-screen z-50 bg-white transition-transform duration-300 ease-in ${showMenu ? "" : "-translate-x-full"}`}
      >
        {/* 顶部 */}
        <div
          className={`flex justify-between items-center p-8 lg:p-16 transition-all duration-600 delay-200 ${showMenu ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Image
            src="/header/lux-logo.png"
            width={1359}
            height={407}
            className="w-auto h-5 lg:h-7"
            alt="logo"
          />
          <button
            className="flex justify-center items-center gap-1 cursor-pointer"
            onClick={() => setShowMenu(false)}
          >
            <Image
              src="/header/close.svg"
              width={18}
              height={18}
              className="size-6 lg:size-4.5"
              alt="close"
            />
            <p className="text-sm hidden lg:block">CLOSE</p>
          </button>
        </div>

        {/* 中间滚动区域 */}
        <div className="flex flex-col gap-24 p-8 lg:p-16 flex-1 overflow-scroll">
          <div
            className={`flex flex-col items-start gap-2 text-2xl font-bold transition-all duration-600 delay-300 ${showMenu ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Link onClick={() => setShowMenu(false)} href="/">
              Home
            </Link>
            <Link onClick={() => setShowMenu(false)} href="/">
              Support
            </Link>
          </div>

          <div
            className={`transition-all duration-600 delay-400 ${showMenu ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <h5 className="text-xl font-bold pb-4">Our apps:</h5>

            <div className="flex flex-col items-start gap-6">
              {apps.map((app, index) => (
                <Link
                  href={app.url}
                  target="_blank"
                  key={index}
                  className="flex gap-4 items-center"
                >
                  <Image
                    src={app.icon}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 rounded-2xl"
                  />

                  <div className="flex flex-col">
                    <h6 className="text-xl font-bold">{app.name}</h6>
                    <p className="opacity-50 text-center text-sm leading-tight">
                      {app.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div
          className={`flex flex-col-reverse lg:flex-row gap-6 justify-between items-center p-16 bg-white transition-all duration-600 delay-500 ${showMenu ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <p className="text-sm opacity-50">Copyright 2026</p>
          <div className="flex gap-6">
            {sociallinks.map((item, index) => (
              <Link key={index} target="_blank" href={item.url}>
                <Image
                  src={item.icon}
                  width={18}
                  height={18}
                  alt={item.name}
                  className="size-4.5 opacity-100 hover:opacity-50"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 遮罩 */}
      <div
        onClick={() => setShowMenu(false)}
        className={`fixed inset-0 z-40 bg-black/60 ${showMenu ? "" : "hidden"}`}
      />
    </>
  );
}
