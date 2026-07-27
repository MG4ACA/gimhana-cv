import { createRouter, createWebHistory } from 'vue-router'
import PLPView from '@/views/PLPView.vue'
import PDPView from '@/views/PDPView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: PLPView },
    { path: '/product/:id', component: PDPView },
  ]
})

export default router
