// 引入组件
import { HomeSlide } from "./_components/HomeSlide";
import { RecipeBrowser } from "./_components/RecipeBrowser";
import { SiteFooter } from "./_components/SiteFooter";

export default function Home() {
  
  return (
    <div>
      <HomeSlide />
      <RecipeBrowser />
      <SiteFooter />
    </div>
  );
}
