import "./scrollWheel.css"

export function HeroScrollIndicator() {
  return (
    // relative的位置是相对于自己原本在正常文档流中的位置偏移
    <div className="relative -bottom-60 flex flex-col items-center gap-2">
      {/* 细线 */}
      <div className="w-px h-10 bg-white/40" />

      {/* 鼠标 */}
      <div className="relative w-5 h-6 border border-white/80 rounded-full overflow-hidden">
        <div className="wheel absolute bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80" />
      </div>
    </div>
  );
}
