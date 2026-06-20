import Image from "next/image";
import xx from "@/public/recipeIcon/cat_crown.svg";
import yy from "@/public/recipeIcon/icon_video.svg";
export function RecipeBrowser() {
  return (
    <div>
      <div className="flex  border-t border-gray-200">
        <div>
          {/* 标题栏 */}
          <div className="flex justify-between text-sm sticky top-0 backdrop-blur-3xl font-sans px-12 py-6">
            <p>AeroPress® recipes! Viewing: all recipes (360)</p>
            <p className="font-display">Sort by:</p>
          </div>

          {/* 网格卡片 */}
          <div className="px-12 grid gap-8 grid-cols-3">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="font-sans py-2 border-t border-gray-200"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2 items-center">
                    <Image src={xx} alt="" className="size-3" />
                    <p className="w-full">From a Barista</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Image src={yy} alt="" className="size-3" />
                    <p>1116</p>
                  </div>
                </div>
                <h3 className="text-lg font-display py-3">
                  James Hoffmann's Ultimate AeroPress Recipe
                </h3>
                <p>James Hoffmann's Ultimate AeroPress Recipe</p>
              </div>
            ))}
          </div>
        </div>

        {/* 筛选栏——sticky + h-screen + overflow-y-auto 实现吸顶滚动 */}
        <div className="max-w-100 h-screen overflow-y-auto bg-amber-50 sticky top-0  border-l border-gray-200">
          <div className="p-8 flex flex-col gap-4">
            <p className=" font-display">Refine your recipe search</p>

            <div className="h-px bg-gray-200 w-full"></div>

            <div>
              <p className="text-lg font-display">My recipes only</p>
              <p className="font-sans">
                Show recipes you've created, public and private
              </p>
            </div>

            <div>
              <p className="text-lg font-display">Category</p>
              <div className="flex flex-col gap-2 py-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1"
                  >
                    <Image src={xx} alt="" className="size-4" />
                    <p>Championship</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Orientation</p>
              <div className="flex justify-between gap-2 py-1">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 w-full"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>Standard</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Filter type</p>
              <div className="flex justify-between gap-2 py-1">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 w-full"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>Paper</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Brew time (minutes)</p>
              <div className="flex justify-between gap-2 py-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 w-full"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>2~5</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Amount of coffee</p>
              <div className="flex justify-between gap-2 py-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 w-full"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>20~30</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Amount of water</p>
              <div className="flex justify-between gap-2 py-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1 w-full"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>200~300</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-lg font-display">Tags</p>
              <div className="flex flex-wrap gap-2 py-1">
                {Array.from({ length: 17 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 font-sans bg-amber-100 px-2 py-1"
                  >
                    <Image src={yy} alt="" className="size-4" />
                    <p>Has Video</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
