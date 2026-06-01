import { defineStore } from "pinia";


// 1、定义一个名叫 counter 的 store
// useCounterStore 不是一个普通变量，而是一个函数。你要调用它，才能拿到真正的 store 对象。
// Vue 生态里有一个命名习惯：凡是这种“调用后获取某种能力/状态”的函数，通常用 useXxx 命名
export const useCounterStore = defineStore("counter", {
  // 共享数据
  state: () => ({
    count: 0,
  }),

  // 修改共享数据的方法
  actions: {
    increase() {
      this.count += 1;
    },
    reset() {
      this.count = 0;
    },
  },
});
