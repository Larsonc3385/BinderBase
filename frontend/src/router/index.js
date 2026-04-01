import { createRouter, createWebHistory } from 'vue-router'
import deckPage from '../components/deckPage.vue'

const routes = [
{ path: '/', redirect: '/deckPage'},
{ path: '/deckPage', name: deckPage, component: deckPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
