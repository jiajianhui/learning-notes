<script setup lang="ts">


    import { ref } from 'vue';

    // 计数器
    const counter = ref<number>(0)
</script>

<template>
    <h1>计数器</h1>
    <section>
        <p>当前计数：{{ counter }}</p>
        <button @click="counter++">+1</button>

    </section>
</template>