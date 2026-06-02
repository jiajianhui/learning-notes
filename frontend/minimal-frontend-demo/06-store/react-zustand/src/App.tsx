// 引入路由、组件
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { CounterPage } from "./pages/CounterPage";
import { TodosPage } from "./pages/TodosPage";

function App() {
  return (
    <>
      <BrowserRouter>
        {/* 导航栏 */}
        <nav>
          <Link to="/counter">计数器</Link>
          <Link to="/todos">待办</Link>
        </nav>

        {/* 定义路由规则 */}
        <Routes>
          <Route path="/" element={<Navigate to="/counter" replace />} />
          <Route path="/counter" element={<CounterPage />} />
          <Route path="/todos" element={<TodosPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
