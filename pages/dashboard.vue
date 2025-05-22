<template>
  <div>
    <ClientOnly>
      <div v-if="isLoading" class="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div class="text-center">
          <p class="text-xl">Načítání...</p>
        </div>
      </div>

      <div v-else-if="user" class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Dashboard</h1>
          </div>
          
          <div v-if="!isSpotifyConnected" class="text-center py-8">
            <p class="text-gray-600 mb-4">Pro plné využití aplikace se připojte ke Spotify</p>
            <button
              @click="connectSpotify"
              class="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
            >
              Připojit Spotify
            </button>
          </div>

          <div v-else class="space-y-4">
            <h2 class="text-xl font-semibold">Připojeno ke Spotify</h2>
            <!-- TODO: Přidat další obsah dashboardu -->
          </div>
        </div>
      </div>

      <div v-else class="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 class="text-3xl font-bold text-center mb-8">Přístup omezen</h1>
          <p class="text-gray-600 mb-6 text-center">Pro přístup do dashboardu se prosím přihlaste nebo zaregistrujte.</p>
          
          <div class="flex justify-center space-x-4 mb-8">
            <button 
              @click="activeTab = 'login'" 
              :class="['px-4 py-2 font-semibold rounded-t-lg', activeTab === 'login' ? 'bg-purple-600 text-white' : 'text-gray-700 bg-gray-200']"
            >
              Přihlášení
            </button>
            <button 
              @click="activeTab = 'register'" 
              :class="['px-4 py-2 font-semibold rounded-t-lg', activeTab === 'register' ? 'bg-purple-600 text-white' : 'text-gray-700 bg-gray-200']"
            >
              Registrace
            </button>
          </div>
          
          <div v-if="activeTab === 'login'" class="space-y-4">
            <form @submit.prevent="handleLoginSubmit" class="space-y-4">
              <div>
                <label for="login-email" class="block text-gray-700 mb-2">E-mail</label>
                <input 
                  id="login-email"
                  v-model="loginForm.email" 
                  type="email" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label for="login-password" class="block text-gray-700 mb-2">Heslo</label>
                <input 
                  id="login-password"
                  v-model="loginForm.password" 
                  type="password" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div v-if="loginError" class="text-red-600 text-sm">{{ loginError }}</div>
              <button 
                type="submit" 
                class="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Přihlásit se
              </button>
            </form>
          </div>
          
          <div v-if="activeTab === 'register'" class="space-y-4">
            <form @submit.prevent="handleRegisterSubmit" class="space-y-4">
              <div>
                <label for="register-email" class="block text-gray-700 mb-2">E-mail</label>
                <input 
                  id="register-email"
                  v-model="registerForm.email" 
                  type="email" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label for="register-password" class="block text-gray-700 mb-2">Heslo</label>
                <input 
                  id="register-password"
                  v-model="registerForm.password" 
                  type="password" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label for="register-confirm-password" class="block text-gray-700 mb-2">Potvrdit heslo</label>
                <input 
                  id="register-confirm-password"
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div v-if="registerError" class="text-red-600 text-sm">{{ registerError }}</div>
              <button 
                type="submit" 
                class="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Zaregistrovat se
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <template #fallback>
        <div class="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
          <div class="text-center">
            <p class="text-xl">Načítání...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";

definePageMeta({
  middleware: ["auth"]
});

const isLoading = ref(true);
const isSpotifyConnected = ref(false);
const router = useRouter();
const user = useState("user", () => null);
const activeTab = ref("login");
const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ email: "", password: "", confirmPassword: "" });
const loginError = ref("");
const registerError = ref("");

// Načteme data uživatele
const fetchUserData = async () => {
  try {
    isLoading.value = true;
    // Pokusíme se načíst uživatele z API
    const response = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response && response.user) {
      await nextTick(() => {
        user.value = response.user;
      });
    }
  } catch (error) {
    // Chyba při načítání uživatele
  } finally {
    isLoading.value = false;
  }
};

// Načtení dat
onMounted(async () => {
  await fetchUserData();
});

// Přihlášení
const handleLoginSubmit = async () => {
  try {
    loginError.value = "";
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: loginForm.value.email,
        password: loginForm.value.password
      }
    });

    // Nastavíme user stav
    await nextTick(() => {
      user.value = response.user;
    });
    
    // Vynucené překreslení
    nextTick(() => {
      // Refresh stránky po úspěšném přihlášení
      window.location.reload();
    });
  } catch (error) {
    loginError.value = error.data?.message || "Nepodařilo se přihlásit. Zkontrolujte své údaje.";
  }
};

const handleRegisterSubmit = async () => {
  try {
    registerError.value = "";
    
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      registerError.value = "Hesla se neshodují";
      return;
    }
    
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        email: registerForm.value.email,
        password: registerForm.value.password
      }
    });

    // Nastavíme user stav
    await nextTick(() => {
      user.value = response.user;
    });
    
    // Vynucené překreslení
    nextTick(() => {
      // Refresh stránky po úspěšné registraci
      window.location.reload();
    });
  } catch (error) {
    registerError.value = error.data?.message || "Nepodařilo se zaregistrovat. Zkuste jiný e-mail.";
  }
};

const connectSpotify = () => {
  // Bude implementováno později
};
</script> 