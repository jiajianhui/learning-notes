import { apps } from "../_data/apps";

import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex flex-col bg-zinc-900 px-6 md:px-20 lg:px-40 py-4 xl:py-20 ">
      <div className="flex justify-between items-center">
        <p className="text-white text-xl xl:text-4xl font-bold basis-30 xl:basis-50">
          Lux — iPhone camera apps, camera reviews and more
        </p>

        <div className="hidden lg:flex justify-between px-6 xl:px-40 flex-1 text-white">
          <button>Home</button>
          <button>Support</button>
        </div>

        <button className="size-11 border border-white/20 rounded-xl flex justify-center items-center cursor-pointer">
          <Image src="/footer/search.svg" alt="" width={17} height={17} />
        </button>
      </div>

      <div className="flex lg:hidden justify-between flex-1 text-white pt-8">
        <button>Home</button>
        <button>Support</button>
      </div>

      <div className="flex flex-col pt-18">
        <h4 className="text-white text-xl font-bold w-full border-b border-white/20 pb-5">
          Our apps
        </h4>

        <div className="flex flex-wrap justify-center items-start gap-10 py-10 xl:py-20">
          {apps.map((app, index) => (
            <Link
              href={app.url}
              target="_blank"
              key={index}
              className="flex flex-col items-center w-60"
            >
              <Image
                src={app.icon}
                alt=""
                width={56}
                height={56}
                className="size-14 mb-2 rounded-2xl"
              />
              <h5 className="text-white text-xl font-bold">{app.name}</h5>
              <p className="text-white/60 text-center text-sm leading-tight">
                {app.description}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-white/40 text-center">Copyright 2026</p>
      </div>
    </footer>
  );
}
