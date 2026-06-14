export function SiteHeader() {
  return (
    <header className="flex justify-end items-center border-y border-gray-200 px-4 md:px-20">
      <p className="py-1">
        To think is to forget a difference, to generalize, to abstract.
      </p>

      {/* self-stretch —— 在交叉轴方向上拉满父级 */}
      <div className="w-px self-stretch bg-gray-200 mx-4" />
      <p>funes</p>
    </header>
  );
}