import { Recipe } from "@/data/types/recipe/recipe";

// 引入组件
import { RecipeOverview } from "./RecipeOverview";
import { Comments } from "./Comments";

type DetailContentProps = {
    recipe: Recipe
}

export function DetailContent({ recipe }: DetailContentProps) {
    return (
      <div className="flex flex-col gap-8">
        {/* 内容段落 */}
        <div className="flex flex-col gap-4 pr-0 lg:pr-20 xl:pr-40 2xl:pr-70">
          {recipe.content.map((item, index) => {
            switch (item.type) {
              // 段落
              case "paragraph":
                return (
                  <p key={index} className="font-sans leading-loose">
                    {item.text}
                  </p>
                );

              // 标题
              case "heading":
                return (
                  <h3 key={index} className="font-display">
                    {item.text}
                  </h3>
                );

              // 列表
              case "list":
                return (
                  <ul
                    key={index}
                    className="list-disc pl-6 marker:text-gray-300 font-sans leading-loose"
                  >
                    {item.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );

              // 带链接段落
              case "linkParagraph":
                return (
                  <p key={item.text} className="font-sans leading-loose">
                    {item.text}{" "}
                    <a
                      href={item.href}
                      target="_blank"
                      className="font-display underline decoration-1 underline-offset-4"
                    >
                      {item.linkText}
                    </a>
                  </p>
                );

              // 视频
              case "video":
                return (
                  <div
                    key={index}
                    className="w-full h-100 pr-40 bg-option-bg"
                  />
                );

              default:
                break;
            }
          })}
        </div>

        {/* 分割线 */}
        <div className="h-px w-full bg-gray-200 my-0 md:my-3 lg:my-6" />

        {/* 移动端下的 Recipe overview */}
        <div className="block lg:hidden">
          <RecipeOverview recipe={recipe} title="Recipe details:" />
        </div>

        {/* 步骤 */}
        <div className="flex flex-col gap-4">
          {recipe.steps.map((item) => (
            <div key={item.id}>
              <h4 className="font-display">step {item.id}</h4>
              <p className="font-sans leading-loose">{item.text}</p>
            </div>
          ))}
        </div>

        {/* 分割线 */}
        <div className="h-px w-full bg-gray-200 my-0 md:my-3 lg:my-6" />

        {/* 评论区 */}
        <div id="comments">
          <Comments />
        </div>
      </div>
    );
}
