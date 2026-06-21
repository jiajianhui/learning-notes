import Image from "next/image";

// 引入图标
import cold from "@/public/recipeIcon/icon_cold.svg";
import video from "@/public/recipeIcon/icon_video.svg";
import good from "@/public/recipeIcon/icon_like.svg";
import refine from "@/public/recipeIcon/icon_filter_refine.svg";

// 引入网格卡片和筛选栏所需的数据
import { recipeCards } from "@/data/recipeData";
import { filterGroups } from "@/data/recipeData";

// 引入组件
import { AppPromoBanner } from "./AppPromoBanner";

import { Fragment } from "react/jsx-runtime";

export function RecipeBrowser() {
  return (
    <div>
      <div className="flex border-t border-gray-200">
        <div>
          {/* 标题栏 */}
          <div className="flex justify-between text-sm sticky z-10 top-0 backdrop-blur-3xl font-sans px-12 py-6">
            <p>AeroPress® recipes! Viewing: all recipes (360)</p>
            <p className="font-display">Sort by:</p>
          </div>

          {/* 网格卡片 */}
          <div className="px-12 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {recipeCards.map((item, index) => (
              
              // Fragment 是 React 提供的空标签，用来包住多个并列元素，不会额外生成真实 DOM，类似<> </>(短语法不能写 key)
              // key 只是 React 识别这一轮 map 渲染结果的内部标识，不会出现在真实 DOM 上
              <Fragment key={index}>
                <div className="font-sans py-2 border-t border-gray-200 hover:border-gray-600 cursor-pointer">
                  {/* 小字部分 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={item.sourceIcon}
                        width={1}
                        height={1}
                        alt=""
                        className="size-4"
                      />
                      <p className="w-full">{item.source}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      {item.hasVideo && (
                        <Image src={video} alt="" className="size-3.5" />
                      )}

                      {item.isCold && (
                        <Image src={cold} alt="" className="size-3.5" />
                      )}

                      <Image src={good} alt="" className="size-4 -mr-1.5" />
                      <p>{item.votes}</p>
                    </div>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-display py-2">{item.title}</h3>
                  {/* 描述 */}
                  <p>{item.description}</p>
                </div>

                {/* index 为 5 时，这一轮会同时渲染卡片和一个横跨整行的 banner */}
                {index === 5 && <AppPromoBanner />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* 筛选栏——sticky + h-screen + overflow-y-auto 实现吸顶滚动 */}
        {/* 筛选栏没写固定宽度时，会先按内部内容估算宽度，但因为它作为 flex 子元素默认允许被压缩(auto而非shrink-0)，所以空间不够时会被左侧 grid 挤窄，文字就换行了。 */}
        <div
          className="
            min-w-100 h-screen overflow-y-auto bg-card-bg 
            sticky top-0  border-l border-gray-200
            hidden lg:block
          "
        >
          <div className="px-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 pt-6">
              <Image src={refine} alt="" className="size-4.5" />
              <p className=" font-display">Refine your recipe search</p>
            </div>

            <div className="h-px bg-gray-200 w-full"></div>

            <div>
              <p className="text-lg font-display">My recipes only</p>
              <p className="font-sans">
                Show recipes you&apos;ve created, public and private
              </p>
            </div>

            {/* 数据渲染 */}
            {filterGroups.map((group) => (
              <div key={group.title}>
                {/* 标题 */}
                <p className="text-lg font-display">{group.title}</p>

                {/* 选项 */}
                <div className={`flex ${group.layout} gap-2 py-1`}>
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
