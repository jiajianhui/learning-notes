import { HeroSlider } from "./_components/HeroSlider";
import { PostGrid } from "./_components/PostGrid";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
export default function Home() {
  return (
    <div className="bg-black">
      <SiteHeader />
      <HeroSlider />
      <PostGrid />
      <SiteFooter />
    </div>
  );
}
