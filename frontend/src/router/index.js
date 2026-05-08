import { createRouter, createWebHistory } from 'vue-router'
import deckPage from '../components/deckPage.vue'
import loginPage from '../components/login.vue'

const routes = [
  { path: '/',         redirect: '/login' },
  { path: '/login',    name: 'Login',    component: loginPage },
  { path: '/deckPage', name: 'DeckPage', component: deckPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router