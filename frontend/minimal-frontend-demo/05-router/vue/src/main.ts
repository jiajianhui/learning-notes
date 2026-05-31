import { createApp } from 'vue'
import App from './App.vue'

// 导入路由
import { router } from './router.ts'

// 2、把 router 接到 App 上
createApp(App).use(router).mount('#app')
