import Image from "next/image";
export function SiteHeader() {
  return (
    <div className="fixed top-0 z-30 w-screen py-6 px-40">
      <div className="flex justify-between items-center px-7 h-16 rounded-2xl bg-white/50 backdrop-blur-xl">
        <button className="flex items-center gap-2.5 text-sm">
          <Image
            src="/header/menu.svg"
            width={14}
            height={14}
            className="size-3.5"
            alt="menu"
          />
          <p>MENU</p>
        </button>

        <Image
          src="/header/lux-logo.png"
          width={320}
          height={320}
          className="w-auto h-7.5"
          alt="logo"
        />
        <button className="flex items-center gap-2.5 text-sm">
          <Image
            src="/header/search.svg"
            width={14}
            height={14}
            className="size-3.5"
            alt="search"
          />
          <p>SEARCH</p>
        </button>
      </div>
    </div>
  );
}
