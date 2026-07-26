import "./scrollWheel.css";

export function HeroScrollIndicator() {
  return (
    <div className="absolute bottom-10 flex flex-col items-center gap-2">
      {/* 细线 */}
      <div className="w-px h-10 bg-white/40" />

      {/* 鼠标 */}
      <button
        onClick={() => {
          document
            .querySelector(".postGrid")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        className="relative w-5 h-6 border border-white/80 rounded-full overflow-hidden cursor-pointer"
      >
        <div className="wheel absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80" />
      </button>
    </div>
  );
}
