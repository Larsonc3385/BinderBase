<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedFormat = ref('Commander')
const formats = ['Commander']

const colors = ['W', 'B', 'U', 'R', 'G']
const selectedColors = ref([])

const cards = ref([
  {
    id: 1,
    name: 'Sol Ring',
    type: 'Artifact',
    cost: 1,
    image: 'https://via.placeholder.com/300x180.png?text=Card+Art',
    text: 'Add {C}{C}.',
  },
])

const filteredCards = computed(() => cards.value)

function performSearch() {}
function toggleColor(color) {
  if (selectedColors.value.includes(color)) {
    selectedColors.value = selectedColors.value.filter(c => c !== color)
  } else {
    selectedColors.value.push(color)
  }
}

function filterType(type) {}

const deck = ref([])

function addToDeck(card) {
  const existing = deck.value.find(e => e.card.id === card.id)
  if (existing) existing.qty++
  else deck.value.push({ card, qty: 1 })
}

function clearDeck() {
  deck.value = []
}

const deckCount = computed(() => deck.value.reduce((sum, e) => sum + e.qty, 0))

const modalOpen = ref(false)
const modalCard = ref({})
</script>

<template>
  <div class="site">
    <header class="header">
      <div class="brand">
        <div class="logo">BB</div>
        <div>
          <h1>BinderBase</h1>
          <p>Deck builder & card browser</p>
        </div>
      </div>

      <div class="header-actions">
        <button class="icon-btn" title="Import">⤓</button>
        <button class="icon-btn" title="Export">⤒</button>
        <button class="btn">Save Deck</button>
      </div>
    </header>

    <div class="main-grid">
      <aside class="sidebar">
        <div class="search">
          <input v-model="searchQuery" type="search" placeholder="Search cards by name, text, type..." />
          <button class="btn small" @click="performSearch">Search</button>
        </div>

        <div class="filter-row">
          <label>Format</label>
          <div class="chips">
            <button
              v-for="fmt in formats"
              :key="fmt"
              class="chip"
              :aria-pressed="selectedFormat === fmt"
              @click="selectedFormat = fmt"
            >
              {{ fmt }}
            </button>
          </div>
        </div>

        <div class="filter-row">
          <label>Colors</label>
          <div class="chips">
            <button
              v-for="color in colors"
              :key="color"
              class="chip"
              @click="toggleColor(color)"
              :aria-pressed="selectedColors.includes(color)"
            >
              {{ color }}
            </button>
          </div>
        </div>
      </aside>

      <main class="content">
        <div class="toolbar">
          <div class="row">
            <button class="btn" @click="filterType('all')">All Cards</button>
            <button class="btn ghost" @click="filterType('creature')">Creatures</button>
            <button class="btn ghost" @click="filterType('spell')">Spells</button>
          </div>
          <div style="margin-left:auto;" class="small">Showing <strong>{{ filteredCards.length }}</strong> results</div>
        </div>

        <section class="card-grid">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="mtg-card"
            role="button"
            tabindex="0"
            @click="addToDeck(card)"
            :title="'Add ' + card.name + ' to deck'"
          >
            <img class="mtg-thumb" :src="card.image" :alt="card.name + ' art'" />
            <div class="meta">
              <div>
                <h4>{{ card.name }}</h4>
                <p class="small">{{ card.type }}</p>
              </div>
              <div class="mana">
                <span class="symbol">{{ card.cost }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <aside class="deck-panel">
        <div class="deck-title">
          <div>
            <h3>Current Deck</h3>
            <div class="small deck-stats">{{ deckCount }} cards</div>
          </div>
          <div>
            <button class="btn small" @click="clearDeck">Clear</button>
          </div>
        </div>

        <div class="drop-zone">Drop cards here or click a card to add</div>

        <div class="deck-list">
          <div class="deck-row" v-for="(entry, index) in deck" :key="index">
            <div class="qty">{{ entry.qty }}</div>
            <div class="name">{{ entry.card.name }}</div>
            <div class="kv small">{{ entry.card.type }}</div>
          </div>
        </div>
      </aside>
    </div>

    <footer class="footer">Built with love for MTG deck building.</footer>
  </div>

  <div class="modal-backdrop" v-if="modalOpen">
    <div class="modal" role="dialog" aria-modal="true">
      <h2>{{ modalCard.name }}</h2>
      <p class="small">{{ modalCard.text }}</p>
      <button class="btn" @click="modalOpen = false">Close</button>
    </div>
  </div>
</template>

<style scoped>
/* You can paste your styles.css content here or import it */
</style>
