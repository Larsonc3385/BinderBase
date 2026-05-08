<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '../services/api.js'

const router = useRouter()

const activeTab = ref('login')
const error = ref(null)

const loginUser = ref('')
const loginPass = ref('')

const signupUser = ref('')
const signupEmail = ref('')
const signupPass = ref('')

function switchTab(tab) {
  activeTab.value = tab
  error.value = null
}

async function NavigatorLogin() {
  error.value = null
  if (!loginUser.value.trim() || !loginPass.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  try {
    const result = await userAPI.login(loginUser.value.trim(), loginPass.value)

    if (!result.valid) {
      error.value = result.message || 'Invalid username or password.'
      return
    }

    localStorage.setItem('username', result.user.username)
    localStorage.setItem('userid', result.user.id)
    router.push('/deckPage')
  } catch (err) {
    error.value = 'Something went wrong. Please try again.'
  }
}

async function NewUser() {
  error.value = null
  if (!signupUser.value.trim() || !signupEmail.value.trim() || !signupPass.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  try {
    const result = await userAPI.create(
      signupUser.value.trim(),
      signupEmail.value.trim(),
      signupPass.value
    )

    if (result.error) {
      error.value = result.message || 'Account creation failed.'
      return
    }

    window.alert(result.message)
    switchTab('login')
  } catch (err) {
    error.value = 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <div class="bb-wrap">
    <div class="bb-card">
      <div class="bb-header">
        <div class="bb-logo">BB</div>
        <h1 class="bb-title">BinderBase</h1>
        <p class="bb-subtitle">Enter, if you dare.</p>
      </div>

      <div class="bb-body">
        <div v-if="error" class="bb-alert">{{ error }}</div>

        <div class="bb-tabs">
          <button
            class="bb-tab"
            :class="{ active: activeTab === 'login' }"
            @click="switchTab('login')"
          >
            Sign in
          </button>
          <button
            class="bb-tab"
            :class="{ active: activeTab === 'signup' }"
            @click="switchTab('signup')"
          >
            Register
          </button>
        </div>

        <!-- Login -->
        <form v-if="activeTab === 'login'" @submit.prevent="NavigatorLogin">
          <div class="bb-field">
            <label class="bb-label">Username</label>
            <input
              v-model="loginUser"
              class="bb-input"
              type="text"
              placeholder="Your username"
              autocomplete="username"
            />
          </div>
          <div class="bb-field">
            <label class="bb-label">Password</label>
            <input
              v-model="loginPass"
              class="bb-input"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>
          <button class="bb-btn-primary" type="submit">Enter the Ledger</button>
        </form>

        <!-- Register -->
        <form v-if="activeTab === 'signup'" @submit.prevent="NewUser">
          <div class="bb-field">
            <label class="bb-label">Username</label>
            <input
              v-model="signupUser"
              class="bb-input"
              type="text"
              placeholder="Choose a username"
              autocomplete="username"
            />
          </div>
          <div class="bb-field">
            <label class="bb-label">Recovery email</label>
            <input
              v-model="signupEmail"
              class="bb-input"
              type="email"
              placeholder="your@email.com"
              autocomplete="email"
            />
          </div>
          <div class="bb-field">
            <label class="bb-label">Password</label>
            <input
              v-model="signupPass"
              class="bb-input"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>
          <button class="bb-btn-primary" type="submit">Inscribe Your Name</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

.bb-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.bb-card {
  width: 100%;
  max-width: 380px;
  background: var(--card-surface);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.bb-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
  text-align: center;
}

.bb-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--magic-blue), var(--magic-purple));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.02em;
}

.bb-title {
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px;
  letter-spacing: 0.03em;
  background: linear-gradient(135deg, var(--magic-cyan), var(--magic-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bb-subtitle {
  font-family: 'Crimson Pro', serif;
  font-size: 15px;
  font-weight: 300;
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.bb-body {
  padding: 1.75rem 2rem;
}

.bb-tabs {
  display: flex;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.bb-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.bb-tab.active {
  background: linear-gradient(135deg, var(--magic-blue), var(--magic-purple));
  color: white;
}

.bb-field {
  margin-bottom: 1rem;
}

.bb-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.bb-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius);
  background: var(--elevated);
  color: var(--text-primary);
  font-family: 'Crimson Pro', serif;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.bb-input:focus {
  border-color: var(--magic-blue);
  box-shadow: var(--glow-blue);
}

.bb-input::placeholder {
  color: var(--text-muted);
}

.bb-btn-primary {
  width: 100%;
  padding: 11px 0;
  margin-top: 0.25rem;
  border: none;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--magic-blue), var(--magic-purple));
  color: white;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: var(--shadow-md);
}

.bb-btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.bb-btn-primary:active {
  transform: translateY(0);
}

.bb-alert {
  padding: 10px 12px;
  border-radius: var(--radius);
  font-family: 'Crimson Pro', serif;
  font-size: 14px;
  margin-bottom: 1rem;
  border: 1px solid var(--danger);
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}
</style>