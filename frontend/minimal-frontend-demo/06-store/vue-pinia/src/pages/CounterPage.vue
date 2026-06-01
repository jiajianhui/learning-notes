<script setup lang="ts">
    // 引入 store
    import { useCounterStore } from '../store/counter'
    // 获取 store 实例，使用 counter 这个全局仓库
    const counter = useCounterStore()
</script>

<template>
    <h1>计数器</h1>
    <section>
        <p>当前计数：{{ counter.count }}</p>

        <button @click="counter.increase()">+1</button>
        <button @click="counter.reset()">重置</button>

    </section>
</template>