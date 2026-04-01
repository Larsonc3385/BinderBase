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
  <deckPage></deckPage>
  <router-view />
</template>

<style scoped></style>
