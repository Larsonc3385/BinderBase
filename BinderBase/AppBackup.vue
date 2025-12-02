<script setup>
import deckPage from './components/deckPage.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const users = ref([])
const current = ref('deckPage')
const testResult = ref(null)
const items = ref([])
const error = ref(null)
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
