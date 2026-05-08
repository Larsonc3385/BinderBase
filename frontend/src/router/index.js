import { createRouter, createWebHistory } from 'vue-router'
import deckPage from '../components/deckPage.vue'
import loginPage from '../components/login.vue'

const routes = [
{ path: '/', redirect: '/deckPage'},
{ path: '/deckPage', name: deckPage, component: deckPage },
{ path: '/login', name: loginPage, component: loginPage}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
