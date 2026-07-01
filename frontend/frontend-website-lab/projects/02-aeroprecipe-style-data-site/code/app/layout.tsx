import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 导入组件
import { SiteHeader } from "./_components/SiteHeader";


// 定义字体，然后在页面中使用字体：在global.css中将tailwindd默认字体改为自己的字体，方便调用
const cutiveMono = localFont({
  src: "./fonts/cutive-mono-400-latin.woff2",
  variable: "--font-cutive-mono",
  display: "swap"
});
const inconsolata = localFont({
  src: "./fonts/inconsolata-700-latin.woff2",
  variable: "--font-inconsolata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "02-aeroprecipe-style-data-site",
  description: "relax"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `data-scroll-behavior="smooth"`：告诉 Next.js 当前页面启用了全局平滑滚动
      // 让它在路由跳转时正确处理滚动行为并消除警告。
      data-scroll-behavior="smooth"
      
      // 只是把字体变量注册到了 html 上，但你没有真正使用字体。
      // 移除了antialiased，它会让字体边缘更平滑，但视觉上也会变细、变轻
      className={`${cutiveMono.variable} ${inconsolata.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
