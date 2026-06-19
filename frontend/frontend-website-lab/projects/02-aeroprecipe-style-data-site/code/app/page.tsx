// 引入组件
import { SiteHeader } from "./_components/SiteHeader";
import { CollectionRail } from "./_components/CollectionRail";
import { RecipeBrowser } from "./_components/RecipeBrowser";

export default function Home() {
  
  return (
    <div>
      <SiteHeader />
      <CollectionRail />
      <RecipeBrowser />
    </div>
  );
}
