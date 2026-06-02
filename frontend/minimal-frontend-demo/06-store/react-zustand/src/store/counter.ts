import { create } from "zustand";

type CountStore = {
  count: number;
  increase: () => void;
  reset: () => void;
};

// 创建一个符合 CountStore 类型的状态仓库。
// set 用来修改 store 里的状态。
// state 是当前仓库里的状态
export const useCounterStore = create<CountStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));

/*

定义一个动作/方法，要用函数
increase: () => ...

新状态依赖旧状态，set 里面用函数
set((state) => ({ count: state.count + 1 }))

新状态不依赖旧状态，set 里面直接用对象
set({ count: 0 })

*/