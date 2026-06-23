
// 不同地址都会使用同一个 page.tsx，只是 id 不同
// 页面组件接收到的不是一个 id 字符串，而是一个包含 params 的 props 对象

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export default async function RecipeDetail({ params }: Props) {

    const { slug } = await params;
    
    return (
      <div>
        <h1>detail {slug}</h1>
      </div>
    );
}