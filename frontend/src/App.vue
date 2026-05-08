<script setup>
import { ref, onMounted } from 'vue'
import Login from './components/login.vue'

//import { testlogin } from '../../src/Functions.js'

import { useRouter, useRoute } from 'vue-router'
// These imports are no longer directly used because <router-view> handles routing
// import Home from './components/Home.vue'
// import Login from './components/Login.vue'

// import { testlogin } from '../Backend/src/oldFiles/Functions.js'

const router = useRouter()
const route = useRoute()
const users = ref([])
const current = ref('Login')
const testResult = ref(null)
const items = ref([])
const error = ref(null)

async function navigateToHome() {
  current.value = 'Home'
  router.push('/Home')
}

</script>

<template>
  <div v-if="route.name === 'Login'"></div>

  <router-view />
</template>