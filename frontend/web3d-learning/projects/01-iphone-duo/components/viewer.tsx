'use client';

import dynamic from 'next/dynamic';

const ProductDemo = dynamic(() => import('./product-demo'), {
  ssr: false,
  loading: () => <p role="status">正在准备 3D 展示…</p>,
});

export default function Viewer() {
  return <ProductDemo />;
}
