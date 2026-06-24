// 引入组件
import { SiteHeader } from "./_components/SiteHeader";
import { HomeSlide } from "./_components/HomeSlide";
import { RecipeBrowser } from "./_components/RecipeBrowser";
import { SiteFooter } from "./_components/SiteFooter";

export default function Home() {
  
  return (
    <div>
      <SiteHeader />
      <HomeSlide />
      <RecipeBrowser />
      <SiteFooter />
    </div>
  );
}
