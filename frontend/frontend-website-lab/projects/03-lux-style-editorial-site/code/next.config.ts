import type { NextConfig } from "next";
import createMDX from "@next/mdx" 

// pageExtensions 允许 .mdx 成为页面。
// withMDX 负责把 MDX 编译成 React 组件。

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  allowedDevOrigins: ["192.168.1.*"],
};

const withMDX = createMDX({})

export default withMDX(nextConfig);
