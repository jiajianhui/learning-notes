import { createApp } from 'vue'
import App from './App.vue'

// 导入路由
import { router } from './router.ts'

// 导入 pinia
import { createPinia } from 'pinia'

// 2、把 router 接到 App 上
// 2、把 Pinia 接到 Vue 应用上
createApp(App).use(createPinia()).use(router).mount('#app')
