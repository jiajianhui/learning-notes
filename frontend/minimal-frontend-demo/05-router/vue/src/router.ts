import { createRouter, createWebHistory } from "vue-router";

import CounterPage from "./pages/CounterPage.vue";
import TodosPage from "./pages/TodosPage.vue";

// 1、路由规则
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", redirect: "/counter" },
        { path: "/counter", component: CounterPage },
        { path: "/todos", component: TodosPage }
    ]

})