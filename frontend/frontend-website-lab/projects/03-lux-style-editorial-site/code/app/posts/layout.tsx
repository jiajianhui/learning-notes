// 只服务于详情页的 layout
export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <main className="postsLayout">{children}</main>;
}
