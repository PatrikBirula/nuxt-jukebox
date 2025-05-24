<template>
  <div>
    <ClientOnly>
      <div v-if="isLoading" class="container mx-auto px-4 py-16 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl">Načítání...</p>
        </div>
      </div>

      <div v-else-if="user" class="container mx-auto px-4 py-8 text-gray-600">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-center">Dashboard</h1>

          <div v-if="!isSpotifyConnected" class="text-center py-8">
            <p class="text-gray-600 mb-4">Pro plné využití aplikace se připojte ke Spotify</p>
            <div v-if="spotifyError" class="text-red-600 mb-4 p-3 bg-red-100 rounded">
              {{ spotifyError }}
            </div>
            <button
              @click="connectSpotify"
              class="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
            >
              Připojit Spotify
            </button>
          </div>

          <div v-else class="space-y-4">
            <div class="bg-white shadow rounded-lg p-6 mt-4">
              <div class="flex flex-col md:flex-row items-center">
                <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div
                    v-if="spotifyProfile?.images && spotifyProfile.images.length > 0"
                    class="w-24 h-24 rounded-full overflow-hidden"
                  >
                    <img
                      :src="spotifyProfile.images[0].url"
                      alt="Profilový obrázek"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                <div class="flex-grow text-center md:text-left text-gray-600">
                  <h3 class="text-xl font-semibold">{{ spotifyProfile?.display_name || "Spotify uživatel" }}</h3>
                  <p class="">{{ spotifyProfile?.email }}</p>
                  <div class="mt-2 text-green-600 flex items-center justify-center md:justify-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Úspěšně připojeno
                  </div>
                </div>

                <div class="mt-4 md:mt-0">
                  <button
                    @click="disconnectSpotify"
                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Odhlásit se
                  </button>
                </div>
              </div>
            </div>

            <!-- TODO: Přidat další obsah dashboardu -->
          </div>
        </div>
      </div>

      <div v-else class="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 class="text-3xl font-bold text-center mb-8">Přístup omezen</h1>
          <p class="text-gray-600 mb-6 text-center">
            Pro přístup do dashboardu se prosím přihlaste nebo zaregistrujte.
          </p>

          <div class="flex justify-center space-x-4 mb-8">
            <button
              @click="activeTab = 'login'"
              :class="[
                'px-4 py-2 font-semibold rounded-t-lg',
                activeTab === 'login' ? 'bg-purple-600 text-white' : 'text-gray-700 bg-gray-200',
              ]"
            >
              Přihlášení
            </button>
            <button
              @click="activeTab = 'register'"
              :class="[
                'px-4 py-2 font-semibold rounded-t-lg',
                activeTab === 'register' ? 'bg-purple-600 text-white' : 'text-gray-700 bg-gray-200',
              ]"
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
        <div class="container mx-auto px-4 py-16 flex items-center justify-center">
          <div class="text-center">
            <p class="text-xl">Načítání...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";

definePageMeta({
  layout: "themed",
  middleware: ["auth"],
});

const isLoading = ref(true);
const isSpotifyConnected = ref(false);
const router = useRouter();
const route = useRoute();
const user = useState("user", () => null);
const activeTab = ref("login");
const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ email: "", password: "", confirmPassword: "" });
const loginError = ref("");
const registerError = ref("");
const spotifyError = ref("");
const spotifyProfile = ref(null);

// Načteme data uživatele
const fetchUserData = async () => {
  try {
    isLoading.value = true;
    // Pokusíme se načíst uživatele z API
    const response = await $fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    if (response && response.user) {
      await nextTick(() => {
        user.value = response.user;
      });

      // Zkontrolujeme, zda má uživatel propojený Spotify účet
      await checkSpotifyConnection();
    }
  } catch (error) {
    // Chyba při načítání uživatele
  } finally {
    isLoading.value = false;
  }
};

// Kontrola Spotify propojení
const checkSpotifyConnection = async () => {
  try {
    const response = await $fetch("/api/spotify/status", {
      method: "GET",
    });

    isSpotifyConnected.value = response.connected;

    // Pokud je připojeno, načteme profil
    if (response.connected) {
      await fetchSpotifyProfile();
    }
  } catch (error) {
    console.error("Chyba při kontrole Spotify připojení:", error);
    isSpotifyConnected.value = false;
  }
};

// Načtení Spotify profilu
const fetchSpotifyProfile = async () => {
  try {
    const response = await $fetch("/api/spotify/profile", {
      method: "GET",
    });

    if (response && response.profile) {
      spotifyProfile.value = response.profile;
    }
  } catch (error) {
    console.error("Chyba při načítání Spotify profilu:", error);
  }
};

// Načtení dat
onMounted(async () => {
  await fetchUserData();

  // Kontrola chybových parametrů v URL po přesměrování ze Spotify
  if (route.query.error) {
    const errorType = route.query.error;
    switch (errorType) {
      case "spotify_auth_failed":
        spotifyError.value = "Autentizace se Spotify selhala.";
        break;
      case "spotify_auth_cancelled":
        spotifyError.value = "Autorizace se Spotify byla zrušena.";
        break;
      case "spotify_configuration_error":
        spotifyError.value = "Chyba konfigurace Spotify API.";
        break;
      case "spotify_callback_error":
        spotifyError.value = "Nepodařilo se dokončit propojení se Spotify.";
        break;
      default:
        spotifyError.value = "Nastala neočekávaná chyba při propojování se Spotify.";
    }

    // Vyčistíme URL od parametrů
    router.replace({ path: route.path });
  }

  // Kontrola úspěšného připojení
  if (route.query.spotify_connected === "true") {
    isSpotifyConnected.value = true;
    // Vyčistíme URL od parametrů
    router.replace({ path: route.path });
  }
});

// Přihlášení
const handleLoginSubmit = async () => {
  try {
    loginError.value = "";
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: loginForm.value.email,
        password: loginForm.value.password,
      },
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
        password: registerForm.value.password,
      },
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
  // Přesměrování na endpoint, který zahájí autentizaci Spotify
  window.location.href = "/api/spotify/auth";
};

const disconnectSpotify = async () => {
  try {
    await $fetch("/api/spotify/disconnect", {
      method: "POST",
    });

    isSpotifyConnected.value = false;
    spotifyProfile.value = null;

    // Zobrazení oznámení o úspěšném odpojení
    alert("Úspěšně jste se odhlásili od Spotify");
  } catch (error) {
    console.error("Chyba při odpojování od Spotify:", error);
    alert("Nastala chyba při odpojování od Spotify");
  }
};
</script>
