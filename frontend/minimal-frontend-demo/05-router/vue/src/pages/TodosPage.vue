<script setup lang="ts">
    import { ref } from 'vue'

    const todos = ref<string[]>([])
    const input = ref("")

    // 添加todo
    function addTodo() {

        // 1、输入验证
        const content = input.value.trim()
        if (!content) {
            return
        }

        // 2、加入 todos
        todos.value.push(content)

        // 3、清空输入框
        input.value = ""

    }

    // 移除todo
    function removeTodo(index: number) {
        todos.value.splice(index, 1)
    }


</script>


<template>
    <h1>todo</h1>
    <section>
        <input v-model="input" type="text">
        <button @click="addTodo()">add</button>

        <ul>
            <li v-for="(todo, index) in todos" :key="index">

                {{ todo }}
                <button @click="removeTodo(index)">删除</button>

            </li>

        </ul>

    </section>
</template>