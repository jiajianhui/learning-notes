import Viewer from '@/components/viewer';

export default function Page() {
  return (
    <main>
      <header><span>WEB3D / 练习 01</span><h1>iPhone Duo</h1>
        <p>从一个动作，理解三维展示。拖动查看机身，切换姿态观察折叠。</p>
      </header>
      <Viewer />
      <footer>学习示例 · Apple 模型的本地研究副本 · 屏幕为静态合成学习版</footer>
    </main>
  );
}
