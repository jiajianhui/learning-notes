import { HeroSlider } from "./_components/HeroSlider";
import { PostGrid } from "./_components/PostGrid";
import { SiteFooter } from "./_components/SiteFooter";
export default function Home() {
  return (
    <div className="bg-black">
      <HeroSlider />
      <PostGrid />
      <SiteFooter />
    </div>
  );
}
