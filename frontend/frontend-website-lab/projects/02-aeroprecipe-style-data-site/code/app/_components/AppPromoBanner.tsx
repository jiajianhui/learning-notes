import ios from "@/public/banner/iosDownload.svg"
import andr from "@/public/banner/androidDownload.svg";
import shots from "@/public/banner/weMakeCoffee_preview_01.webp"

import Image from "next/image";

export function AppPromoBanner() {
  return (
    <div className="col-span-full p-10 bg-option-bg flex flex-col gap-6 pr-70 relative overflow-hidden cursor-pointer">
      <h3 className="font-display text-xl">Download the We Make Coffee app</h3>
      <p className="font-sans">
        Introducing We Make Coffee - the AeroPrecipe experience you know and
        love, made for your phone. Available now for iOS and Android.
      </p>

      {/* 按钮 */}
      <div className="flex items-center gap-6">
        <Image src={ios} alt="" />
        <Image src={andr} alt="" />
        <div className="font-sans bg-black h-full px-4 text-white flex items-center rounded-md">
          Leare More
        </div>
      </div>

      <Image src={shots} alt="" className="absolute w-40 right-14 rotate-4" />
    </div>
  );
}
