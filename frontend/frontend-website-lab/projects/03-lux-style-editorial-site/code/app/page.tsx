import { HeroSlider } from "./_components/HeroSlider";
import { PostGrid } from "./_components/PostGrid";
export default function Home() {
  return (
    <main className="homeContent bg-black">
      {/* sr-only 视觉上隐藏、屏幕阅读器仍然能读取、搜索引擎能理解页面主标题 */}
      <h1 className="sr-only">
        Lux — iPhone camera apps, camera reviews and more
      </h1>
      <HeroSlider />
      <PostGrid />
    </main>
  );
}
