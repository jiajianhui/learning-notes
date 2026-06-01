import { useState } from "react";

export function CounterPage() {
  // 计数器状态
  const [counter, setCounter] = useState<number>(0);

  return (
    <>
      <h1>计数器</h1>
      <section>
        <span>当前计数：{counter}</span>
        <button onClick={() => setCounter((prevCounter) => prevCounter + 1)}>
          +1
        </button>
      </section>
    </>
  );
}
