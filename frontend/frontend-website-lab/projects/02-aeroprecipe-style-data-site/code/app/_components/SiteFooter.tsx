import Image from "next/image";

// 导入图片
import footer from "@/public/footer/footer.png";

// icon
const socialIcons = [
  {
    name: "instagram",
    icon: "/footer/instagram-logo-bold.svg",
    href: "https://github.com/jiajianhui",
  },
  {
    name: "facebook",
    icon: "/footer/facebook-logo-bold.svg",
    href: "https://github.com/jiajianhui",
  },
  {
    name: "x",
    icon: "/footer/twitter-logo-bold.svg",
    href: "https://github.com/jiajianhui",
  },
  {
    name: "youtube",
    icon: "/footer/youtube-logo-bold.svg",
    href: "https://github.com/jiajianhui",
  },
  {
    name: "email",
    icon: "/footer/envelope-bold.svg",
    href: "https://github.com/jiajianhui",
  },
];

export function SiteFooter() {
  return (
    <div className="hidden lg:flex justify-between fixed w-full bottom-0 py-5 pr-14 pl-36 border-t bg-white border-gray-200">
      {/* 图片、文字 */}
      <div className="flex">
        <Image src={footer} alt="" className="absolute bottom-0 left-10 w-24" />
        <p className="font-sans text-sm">
          Enjoying AeroPrecipe? Experience it on mobile with the{" "}
          <a
            href="https://github.com/jiajianhui"
            target="_blank"
            className="underline underline-offset-2 font-black"
          >
            We Make Coffee app
          </a>{" "}
          - available now.
        </p>
      </div>

      {/* icon 链接 */}
      <div className="flex items-center gap-6">
        {socialIcons.map((item) => (
          /* 
           aria-label：给屏幕阅读器说明链接用途，提高可访问性 
           title：鼠标悬停时显示提示文字 
           alt=""：既用于屏幕阅读器描述图片，也用于在图片加载失败时显示替代文字。 
           */
          <a
            href={item.href}
            target="_blank"
            aria-label={item.name}
            title={item.name}
            key={item.name}
            className="shrink-0"
          >
            <Image
              src={item.icon}
              alt=""
              width={1}
              height={1}
              className="size-4.5 opacity-50 hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
