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
        <div className="min-w-90 h-screen overflow-y-auto bg-amber-50 sticky top-0  border-l border-gray-200">
          {Array.from({ length: 100 }).map((_, index) => (
            <h1 key={index}>xx</h1>
          ))}
        </div>
      </div>
    </div>
  );
}
