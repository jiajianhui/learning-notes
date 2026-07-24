import "./postGrid.css"

export function PostGrid() {
    return (
      <div className="postGrid">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="postGridItem">
            <div className="w-full h-full bg-amber-200 rounded-[40px]" />
          </div>
        ))}
      </div>
    );
}