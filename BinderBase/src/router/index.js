import { createRouter, createWebHistory } from 'vue-router'
import home from '../components/home.vue'
import deckPage from '../components/deckPage.vue'

const routes = [
{ path: '/', redirect: '/deckPage'},
{ path:'/home', name: 'home', component: home},
{ path: '/deckPage', name: deckPage, component: deckPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
