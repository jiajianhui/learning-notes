import Image from "next/image";

// 导入图片
import footer from "@/public/footer/footer.png";
import video from "@/public/recipeIcon/icon_video.svg";

export function SiteFooter() {
  return (
    <div className="flex justify-between fixed w-full bottom-0 py-5 pr-20 pl-36 border-t bg-white border-gray-200">
      <div className="flex">
        <Image src={footer} alt="" className="absolute bottom-0 left-10 w-24" />
        <p className="font-sans text-sm">
          Enjoying AeroPrecipe? Experience it on mobile with the{" "}
          <a href="http://" className="underline underline-offset-2 font-black">
            We Make Coffee app
          </a>{" "}
          - available now.
        </p>
      </div>

      {/* icon 链接 */}
      <div className="flex items-center gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Image key={index} src={video} alt="" className="size-5" />
        ))}
      </div>
    </div>
  );
}
