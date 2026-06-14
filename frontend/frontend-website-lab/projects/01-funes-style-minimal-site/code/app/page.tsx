// 引入组件
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteBody } from "./_components/SiteBody";

export default function Home() {
  
  return (
    <div className="flex flex-col py-4 font-mono text-sm min-h-screen">
      <SiteHeader />

      <SiteBody />

      <SiteFooter />
    </div>
  );
}
