<script setup>

defineProps({
  navigateToHome: {
    type: Function,
    required: false,
  }
})
// Frontend routing imports
import {useRouter} from 'vue-router';
import {ref, nextTick} from 'vue';
// hosting API fetch helper
import { apiFetch } from '../services/api.js'

const users = ref([]);
const router = useRouter();

// Login handler
async function NavigatorLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await apiFetch('/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (!result.valid) {
    window.alert(result.message);
    return;
  }

  console.log(result);
  localStorage.setItem('username', result.user.username);
  localStorage.setItem('userid', result.user.id);

  // Redirect
  router.push('/deckPage');
}

// Account creation handler
async function NewUser() {
  const username = document.querySelector("input[name='uname']").value;
  const password = document.querySelector("input[name='pword']").value;

  const response = await apiFetch('/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const result = await response.json();
  window.alert(result.message);
  signUpModal.value = false;
};

</script>


<template>
  <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul>
  <div>
    <p>Login to reclaim your characters and continue your quest. 
      <br>Sign up to inscribe your name in the Great Ledger and forge your legend from scratch.
      <br>Choose wisely, for every great tale begins with a single click...And remember, fortune favors the bold. Enter, if you dare.</p>

    <br>

    <form class="box1" @submit.prevent="NavigatorLogin">
      <p>Username</p>
      <input type="text" placeholder="Enter Username" id="username" name="username">
      <br>
      <p>Password</p>
      <input type="password" placeholder="Enter Password" id="password" name="password">
      <br>
      <br>
      <!--<button onclick="window.alert('Failed Login')">Login</button>-->
      <button class="parchmentButton" type="submit">Login</button>
      <br>
      <button class="parchmentButton" type="button" @click="openSignUp">Sign Up</button>
      <br>

      
      <button class = "linkButton" type="button" @click="openForgotPass">Forgot Password</button>
    </form>

</div>

    <div v-if="signUpModal" id="signUp" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Pick a Username, Password, and Recovery Email for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="password" placeholder="Enter Password" name="pword">
        <br>
        <input type="text" placeholder="Enter Recovery Email" name="RecoveryEmail">
        <br>
        <br>
        <button class = "popupButton" @click="NewUserSound()"> Submit </button>
        <button class = "popupButton" type="button" @click="signUpModal = false">Cancel</button>
      </div>
      </div>
    </div>

  
</template>

<style scoped>

</style>