import { useCounterStore } from "../store/counter";

export function CounterPage() {

  const counter = useCounterStore((state) => state.count)
  const increase = useCounterStore((state) => state.increase);
  const reset = useCounterStore((state) => state.reset);

  return (
    <>
      <h1>计数器</h1>
      <section>
        <span>当前计数：{counter}</span>
        <button onClick={increase}>+1</button>
        <button onClick={reset}>重置</button>
      </section>
    </>
  );
}
