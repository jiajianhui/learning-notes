import { HeroSlider } from "./_components/HeroSlider";
import { PostGrid } from "./_components/PostGrid";
export default function Home() {
  return (
    <div className="bg-black">
      <HeroSlider />
      <PostGrid />
    </div>
  );
}
