"use client";
import Image from "next/image";
import Link from "next/link";

// 引入图标
import cold from "@/public/recipeIcon/icon_cold.svg";
import video from "@/public/recipeIcon/icon_video.svg";
import good from "@/public/recipeIcon/icon_like.svg";
import refine from "@/public/recipeIcon/icon_filter_refine.svg";

import arrow from "@/public/chevron-down.svg";

// 引入网格卡片和筛选栏所需的数据
import { recipeCards } from "@/data/recipeData";
import { filterGroups } from "@/data/recipeData";

// 引入组件
import { AppPromoBanner } from "./AppPromoBanner";

import { Fragment } from "react/jsx-runtime";

// select 数据
const sortOptions = [
  { label: "Most votes", value: "votes-desc" },
  { label: "Least votes", value: "votes-asc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Shuffle", value: "shuffle" },
];

import { useState } from "react";

export function RecipeBrowser() {
  const [currentSelect, setSelect] = useState(sortOptions[0].value);

  return (
    <div>
      <div className="flex border-t border-gray-200">
        <div>
          {/* 标题栏 */}
          <div className="flex items-center text-sm sticky z-10 top-0 backdrop-blur-3xl font-sans px-12 py-6">
            <p>AeroPress® recipes! Viewing: all recipes (360)</p>

            <div className="flex absolute right-12 items-center justify-baseline gap-2">
              <p className="font-display">Sort by:</p>

              {/* 下拉框 */}
              <div className="relative">
                <select
                  value={currentSelect}
                  // 用户切换 option
                  // → 浏览器触发 change 事件
                  // → React 接收到事件并调用 onChange
                  // → e.target.value 获取当前选中的 option.value
                  // → setSelect 更新 select 状态
                  onChange={(e) => setSelect(e.target.value)}
                  className="
                    appearance-none outline-none cursor-pointer 
                    pl-3 pr-8 py-1 border rounded-sm bg-white
                    border-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300
                  "
                >
                  {/* 渲染选项 */}
                  {sortOptions.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Image
                  src={arrow}
                  alt=""
                  // pointer-events-none 不接收鼠标点击，点击事件会穿透到下面的 <select>。
                  // top-1/2 元素顶部位于父元素高度的 50%，也就是先把图标顶部放到父元素垂直中线。
                  // -translate-y-1/2 向上移动自身高度的 50%，让图标真正垂直居中。
                  className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 size-4"
                />
              </div>
            </div>
          </div>

          {/* 网格卡片 */}
          <div className="px-12 pb-20 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {recipeCards.map((item, index) => (
              // Fragment 是 React 提供的空标签，用来包住多个并列元素，不会额外生成真实 DOM，类似<> </>(短语法不能写 key)
              // key 只是 React 识别这一轮 map 渲染结果的内部标识，不会出现在真实 DOM 上
              <Fragment key={index}>
                <Link href={`/recipes/${item.slug}`}>
                  <div className="font-sans pt-2 border-t border-gray-200 hover:border-gray-600 cursor-pointer">
                    {/* source、status */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={item.source.icon}
                          width={1}
                          height={1}
                          alt=""
                          className="size-4"
                        />
                        <p className="w-full">{item.source.name}</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        {item.hasVideo && (
                          <Image src={video} alt="" className="size-3.5" />
                        )}

                        {item.isCold && (
                          <Image src={cold} alt="" className="size-3.5" />
                        )}

                        <Image src={good} alt="" className="size-4 -mr-1.5" />
                        <p>{item.stats.votes}</p>
                      </div>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-lg font-display py-1">{item.title}</h3>
                    {/* 描述 */}
                    <p>{item.description}</p>
                  </div>
                </Link>

                {/* index 为 5 时，这一轮会同时渲染卡片和一个横跨整行的 banner */}
                {index === 5 && <AppPromoBanner />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* 筛选栏——sticky + h-screen + overflow-y-auto 实现吸顶滚动 */}
        {/* 筛选栏作为 flex 子元素且未设置固定宽度时，
            flex-basis: auto 会根据 width 或内容计算初始宽度；
            同时默认 flex-shrink: 1，空间不足时会被压缩，
            因而可能被左侧 grid 区域挤窄，导致文字换行。 
        */}
        <div
          className="
            min-w-100 h-screen overflow-y-auto bg-card-bg 
            sticky top-0  border-l border-gray-200
            hidden lg:block
          "
        >
          <div className="pl-8 pr-12 pb-20 flex flex-col pt-6 gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Image src={refine} alt="" className="size-4.5" />
              <p className=" font-display">Refine your recipe search</p>
            </div>

            <div className="h-px bg-gray-200 w-full"></div>

            <div className="flex flex-col gap-2">
              <p className="font-display">My recipes only</p>
              <p className="font-sans text-sm opacity-60">
                Show recipes you&apos;ve created, public and private
              </p>
            </div>

            {/* 数据渲染 */}
            {filterGroups.map((group) => (
              <div key={group.title}>
                {/* 标题 */}
                <p className="font-display">{group.title}</p>

                {/* 选项 */}
                <div className={`flex ${group.layout} gap-1.5 py-1`}>
                  {group.options.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 font-sans bg-option-bg px-2.5 py-1.5 rounded-md ${group.optionWidth}`}
                    >
                      {/* && 是短路渲染：左边有值时才渲染右边的 Image */}
                      {item.icon && (
                        <Image
                          src={item.icon}
                          width={1}
                          height={1}
                          alt=""
                          className="size-4"
                        />
                      )}

                      <p>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
