<script setup>

defineProps({
  navigateToHome: {
    type: Function,
    required: false,
  }
})
// Frontend routing imports
import {useRouter} from 'vue-router';
import {ref, onMounted, nextTick} from 'vue';
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

// Account creation sound effect
async function NewUserSound() {
  sounds.sparkle.currentTime=0
  sounds.sparkle.play()
  NewUser()
}

// Account creation handler
async function NewUser() {
  const username = document.querySelector("input[name='uname']").value;
  const password = document.querySelector("input[name='pword']").value;
  const email = document.querySelector("input[name='RecoveryEmail']").value;

  const response = await apiFetch('/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const result = await response.json();
  window.alert(result.message);
  signUpModal.value = false;
};

function openForgotPass() {
  forgotPassModal.value = true;
}
function openSignUp() {
  signUpModal.value = true;
}

const DISCORD_REDIRECT = import.meta.env.VITE_DISCORD_REDIRECT;

function loginWithDiscord() {
  console.log(DISCORD_REDIRECT);
  window.location.href = DISCORD_REDIRECT;

  //window.location.href ="https://discord.com/oauth2/authorize?client_id=1488942146244448406&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fuser%2Fdiscord%2Fcallback&scope=identify+email"
}

// this is the google login stuff. WE NEED THIS!!!!!!!!!
const googleBtn = ref(null);

//this allows the google button to be there on first load
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const discordToken = urlParams.get('token');

  if (discordToken) {
    console.log('Discord token found, attempting redirect...')
    localStorage.setItem('authToken', discordToken)
    document.cookie = "session=active; path=/";

    try {
      const discordPayload = JSON.parse(atob(discordToken.split('.')[1])) //User token information
      localStorage.setItem('userid', discordPayload.id); // add this line
      localStorage.setItem('pfp', discordPayload.pfp);
      localStorage.setItem('tutorial', discordPayload.tutorial);
      
    
      // If username is null, fetch it from the backend using the id
      if (discordPayload.username) {
        localStorage.setItem('username', discordPayload.username)
        router.push('/Home')
      } else {
        console.warn('Username is null in token, fetching from server...')
        const res = await apiFetch('/user/fetchUsername', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: discordPayload.id })
        })
        const data = await res.json()
        console.log('Fetched username from server:', data.username)
        localStorage.setItem('username', data.username || 'Unknown')
        router.push('/Home')
      }
    } catch (e) {
      console.error('Failed to decode token or fetch username:', e)
      router.push('/Home') // push anyway, home page can handle missing username
    }
    return
  }

  // Check for existing session AFTER handling Discord redirect
  const token = localStorage.getItem('authToken');
  const hasSession = document.cookie.split('; ').find(row => row.startsWith('session='));
  if (token && hasSession) {
    router.push('/Home');
    return;
  }

  await nextTick()
  await waitForGoogle()

  //google button stuff
  if (!window.google) {
    console.error("Google script not loaded")
    return
  }

  google.accounts.id.initialize({
    client_id: "812526800082-kphkn27aalckafulgu3kgaoti517vv8g.apps.googleusercontent.com",
    callback: handleCredentialResponse
  })

  google.accounts.id.renderButton(
    googleBtn.value,
    {
      theme: "outline",
      size: "large",
      width: 260,
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left"
    }
  )
});

function waitForGoogle(timeout =  10000) {
  return new Promise((resolve, reject) => {
    if (window.google) return resolve()

    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval)
        resolve()
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      reject(new Error("Google GSI script failed to load in time"))
    }, timeout)
  })
}

async function handleCredentialResponse(response) {
  const idToken = response.credential;
  try {
    const res = await apiFetch('/user/google-login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({token: idToken})
    });

    const result = await res.json();

    if(!result.valid) {
      alert(result.message);
      return;
    }

    if(!result.token || !result.user?.username) {
      alert("Login failed: Incomplete response from server")
    }

    localStorage.setItem('authToken', result.token);
    localStorage.setItem('username', result.user.username);
    localStorage.setItem('role', result.user.role)
    localStorage.setItem('userid', result.user.id );
    localStorage.setItem('pfp', result.pfp );
    localStorage.setItem('tutorial', result.tutorial);

    document.cookie = "session=active; path=/";
    router.push('/Home');
    
  } catch (err) {
    console.error("Google Login Failed:", err);
    alert("Google Login failed");
  }
}


</script>


<template>
  <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul>
  <div class="login" v-sound>
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

    <!-- 
   THIS IS ALL THE GOOGLE STUFF
    -->
    
    <div class="oauth-stack">
      <div ref="googleBtn"></div>
      <button class="oauth-btn discord-btn" @click="loginWithDiscord">
        <img src="../assets/images/icons/Discord_Symbol.svg" class="oauth-icon">
        Sign in with Discord
      </button>
</div>

    <!-- End of discord stuff -->

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

    


    <div v-if="forgotPassModal" id="forgotPass" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Enter your email and we will send you a link to reset your password</p>
        <br>
        <input type="text" placeholder="Enter Email" name="email">
        <br>
        <br>
        <button class = "popupButton" @click="ResetPassword()">Submit</button>
        <button class = "popupButton" type="button" @click="forgotPassModal = false">Cancel</button>
      </div>
    </div>
    </div>
  </div>

  
</template>

<style scoped>
p {
  font-size: 0.85rem;
}
.oauth-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 10px;
}

/* shared oauth button look */
.oauth-btn {
  width: 260px;
  height: 44px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.15s ease;
  border: 1px solid #dadce0;
  background: white;
}

.oauth-btn:hover {
  background: #f7f8f8;
}

/* Discord color */
.discord-btn {
  background: #5865F2;
  border: none;
  color: white;
}

.discord-btn:hover {
  background: #4752c4;
}

.oauth-icon {
  width: 18px;
  height: 18px;
}

</style>