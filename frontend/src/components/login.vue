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
  if (!signupUser.value.trim() ||!signupPass.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  try {
    const result = await userAPI.create(signupUser.value.trim(), signupPass.value)

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
        <div v-if="error" class="alert alert-error">{{ error }}</div>

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
              type="text"
              placeholder="Your username"
              autocomplete="username"
            />
          </div>
          <div class="bb-field">
            <label class="bb-label">Password</label>
            <input
              v-model="loginPass"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>
          <button class="bb-btn-primary" type="submit">Login</button>
        </form>

        <!-- Register -->
        <form v-if="activeTab === 'signup'" @submit.prevent="NewUser">
          <div class="bb-field">
            <label class="bb-label">Username</label>
            <input
              v-model="signupUser"
              type="text"
              placeholder="Choose a username"
              autocomplete="username"
            />
          </div>
          <div class="bb-field">
            <label class="bb-label">Password</label>
            <input
              v-model="signupPass"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>
          <button class="bb-btn-primary" type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: var(--surface);
  border: var(--border-gold);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(139,105,20,0.1);
  position: relative;
}

.bb-card::before {
  content: '';
  position: absolute;
  top: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.bb-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: var(--border-mid);
  text-align: center;
}

.bb-logo {
  width: 52px;
  height: 52px;
  border-radius: var(--radius);
  border: var(--border-gold);
  background: var(--void);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--gold-bright);
  box-shadow: var(--shadow-sm), inset 0 0 12px rgba(139,105,20,0.1);
  letter-spacing: 0.02em;
}

.bb-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gold-bright);
  letter-spacing: 0.04em;
  margin: 0 0 4px;
}

.bb-subtitle {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-style: italic;
  font-weight: 300;
  color: var(--text-muted);
  margin: 0;
}

.bb-body {
  padding: 1.75rem 2rem;
}

.bb-tabs {
  display: flex;
  border: var(--border-mid);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.bb-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-family: var(--font-heading);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-transform: uppercase;
}

.bb-tab.active {
  background: var(--gold-mid);
  color: var(--gold-light);
}

.bb-field {
  margin-bottom: 1rem;
}

.bb-label {
  display: block;
  font-family: var(--font-heading);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.bb-btn-primary {
  width: 100%;
  padding: 0.6rem 0;
  margin-top: 0.25rem;
  border: var(--border-gold);
  border-radius: var(--radius-sm);
  background: var(--gold-mid);
  color: var(--gold-light);
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.bb-btn-primary:hover {
  background: var(--gold);
  border-color: var(--gold-bright);
  color: var(--void);
}
</style>