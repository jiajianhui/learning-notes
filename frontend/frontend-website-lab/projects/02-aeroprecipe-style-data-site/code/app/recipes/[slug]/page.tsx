// 动态标签页标题
import type { Metadata } from "next";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = recipeData.find((item) => item.slug === slug);

  return {
    title: recipe?.title
      ? `${recipe.title} | AeroPrecipe by ${recipe.meta.creator.name}`
      : "Recipe",
  };
}

// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// 引入类型
import { recipeData } from "@/data/recipeData";

// 引入组件
import { notFound } from "next/navigation";
import { DetailHeader } from "./_components/DetailHeader";
import { DetailContent } from "./_components/DetailContent";
import { RecipeOverview } from "./_components/RecipeOverview";

export default async function RecipeDetail({ params }: Props) {
  // 1、拿到路由参数 slug
  const { slug } = await params;

  // 2、查找对应的数据
  const recipe = recipeData.find((item) => item.slug === slug);

  // 3、类型收窄
  /* 
    find() 可能找不到数据，此时 recipe 是 undefined。
    先排除 undefined，TypeScript 才能把 recipe 从
    Recipe | undefined 收窄为 Recipe，后面才能安全访问属性。
  */
  if (!recipe) {
    // 没找到对应数据，显示 Next.js 的 404 页面
    notFound();
  }

  return (
    <div className="flex">
      <div className="px-12 border-r border-gray-200">

        <DetailHeader recipe={recipe} />
        <DetailContent recipe={recipe} />
        
      </div>

      {/* 电脑端下的 Recipe overview */}
      <div className="sticky top-0 self-start w-95 shrink-0 pl-4 pb-12 pr-12 hidden lg:block">
        <RecipeOverview recipe={recipe} title="Recipe overview" />
      </div>
    </div>
  );
}
