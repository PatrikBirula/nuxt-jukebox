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

            <h2 class="text-3xl font-bold text-center mt-8 mb-6">Nastavení jukeboxu v 5 krocích</h2>
            
            <div class="grid grid-cols-1 gap-6">
              <!-- Krok 1: Připojení ke Spotify -->
              <div class="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500 relative overflow-hidden transition-all hover:shadow-xl">
                <div class="absolute -top-10 -right-10 bg-green-100 w-24 h-24 rounded-full flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.49 16.44C16.31 16.72 15.96 16.8 15.68 16.62C13.71 15.36 11.12 15.17 7.97 15.95C7.66 16.03 7.36 15.82 7.28 15.5C7.2 15.19 7.41 14.89 7.73 14.81C11.23 13.95 14.17 14.17 16.44 15.6C16.71 15.78 16.79 16.13 16.61 16.41V16.44ZM17.61 13.75C17.39 14.1 16.94 14.2 16.59 13.98C14.28 12.51 10.95 12.2 7.74 13.12C7.34 13.24 6.93 13 6.81 12.6C6.69 12.2 6.93 11.79 7.33 11.67C11 10.63 14.77 10.99 17.48 12.73C17.83 12.95 17.93 13.41 17.71 13.75H17.61ZM17.74 10.99C15.03 9.31 10.36 9.19 7.32 10.13C6.85 10.29 6.35 10.01 6.19 9.54C6.04 9.07 6.31 8.57 6.78 8.41C10.31 7.33 15.53 7.47 18.74 9.45C19.26 9.76 19.42 10.44 19.11 10.95C18.81 11.47 18.12 11.63 17.61 11.32L17.74 10.99Z" />
                  </svg>
                </div>
                <div class="flex items-center">
                  <div class="bg-green-500 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    1
                  </div>
                  <h2 class="text-xl font-semibold text-gray-700">Krok 1: Připojení ke Spotify</h2>
                </div>
                <p class="mt-3 ml-14 text-gray-600">
                  Připojte se ke svému Spotify Premium účtu.
                </p>
                <div class="ml-14 mt-4 flex items-center">
                  <div v-if="isSpotifyConnected" class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Hotovo
                  </div>
                  <button 
                    v-else
                    @click="connectSpotify" 
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Připojit Spotify
                  </button>
                </div>
              </div>

              <!-- Krok 2: Nahrání QR kódu pro platby -->
              <div class="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 relative overflow-hidden transition-all hover:shadow-xl">
                <div class="absolute -top-10 -right-10 bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,11h8V3H3V11z M5,5h4v4H5V5z"/>
                    <path d="M3,21h8v-8H3V21z M5,15h4v4H5V15z"/>
                    <path d="M13,3v8h8V3H13z M19,9h-4V5h4V9z"/>
                    <path d="M19,19h2v2h-2v-2z"/>
                    <path d="M13,13h2v2h-2v-2z"/>
                    <path d="M15,15h2v2h-2v-2z"/>
                    <path d="M13,17h2v2h-2v-2z"/>
                    <path d="M15,19h2v2h-2v-2z"/>
                    <path d="M17,17h2v2h-2v-2z"/>
                    <path d="M17,13h2v2h-2v-2z"/>
                    <path d="M19,15h2v2h-2v-2z"/>
                  </svg>
                </div>
                <div class="flex items-center">
                  <div class="bg-blue-500 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    2
                  </div>
                  <h2 class="text-xl font-semibold text-gray-700">Krok 2: QR kód pro platby</h2>
                </div>
                <p class="mt-3 ml-14 text-gray-600">
                  Nahrajte QR kód pro příspěvky od hostů.
                </p>
                <div class="ml-14 mt-4">
                  <div v-if="paymentQrCode" class="flex items-center gap-4">
                    <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Nahráno
                    </div>
                    <button 
                      @click="uploadPaymentQR" 
                      class="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Změnit
                    </button>
                  </div>
                  <button 
                    v-else
                    @click="uploadPaymentQR" 
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Nahrát QR kód
                  </button>
                </div>
              </div>

              <!-- Krok 3: Nastavení účelu příspěvků -->
              <div class="bg-white shadow-lg rounded-xl p-6 border-l-4 border-purple-500 relative overflow-hidden transition-all hover:shadow-xl">
                <div class="absolute -top-10 -right-10 bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
                  </svg>
                </div>
                <div class="flex items-center">
                  <div class="bg-purple-500 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    3
                  </div>
                  <h2 class="text-xl font-semibold text-gray-700">Krok 3: Účel příspěvků</h2>
                </div>
                <p class="mt-3 ml-14 text-gray-600">
                  Napište, na co hosté přispívají (novomanželé, charita, personál).
                </p>
                <div class="ml-14 mt-4">
                  <div v-if="donationPurpose" class="mb-2">
                    <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Nastaveno
                    </div>
                    <p class="text-gray-700 italic">{{ donationPurpose }}</p>
                  </div>
                  <input 
                    v-model="donationPurpose" 
                    type="text" 
                    placeholder="Např. Příspěvek pro novomanžele" 
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  >
                  <button 
                    @click="saveDonationPurpose" 
                    class="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Uložit účel
                  </button>
                </div>
              </div>

              <!-- Krok 4: Výběr playlistu -->
              <div class="bg-white shadow-lg rounded-xl p-6 border-l-4 border-yellow-500 relative overflow-hidden transition-all hover:shadow-xl">
                <div class="absolute -top-10 -right-10 bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12ZM10 19C8.9 19 8 18.1 8 17C8 15.9 8.9 15 10 15C11.1 15 12 15.9 12 17C12 18.1 11.1 19 10 19Z" />
                  </svg>
                </div>
                <div class="flex items-center">
                  <div class="bg-yellow-500 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    4
                  </div>
                  <h2 class="text-xl font-semibold text-gray-700">Krok 4: Výběr playlistu</h2>
                </div>
                <p class="mt-3 ml-14 text-gray-600">
                  Vyberte základní playlist, který bude hrát, pokud nikdo nepřidá písničku.
                </p>
                <div class="ml-14 mt-4">
                  <div v-if="defaultPlaylist" class="flex items-center gap-4">
                    <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Playlist: {{ defaultPlaylist.name }}
                    </div>
                    <button 
                      @click="selectDefaultPlaylist" 
                      class="text-yellow-500 hover:text-yellow-700 transition-colors"
                    >
                      Změnit
                    </button>
                  </div>
                  <button 
                    v-else
                    @click="selectDefaultPlaylist" 
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Vybrat playlist
                  </button>
                </div>
              </div>

              <!-- Krok 5: Spuštění jukeboxu -->
              <div class="bg-white shadow-lg rounded-xl p-6 border-l-4 border-red-500 relative overflow-hidden transition-all hover:shadow-xl">
                <div class="absolute -top-10 -right-10 bg-red-100 w-24 h-24 rounded-full flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
                <div class="flex items-center">
                  <div class="bg-red-500 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    5
                  </div>
                  <h2 class="text-xl font-semibold text-gray-700">Krok 5: Spuštění jukeboxu</h2>
                </div>
                <p class="mt-3 ml-14 text-gray-600">
                  Spusťte jukebox a nechte hosty si vybírat hudbu.
                </p>
                <div class="ml-14 mt-4">
                  <div v-if="jukeboxStarted" class="flex items-center gap-4">
                    <div class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Jukebox spuštěn
                    </div>
                    <router-link 
                      to="/jukebox" 
                      class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Přejít do jukeboxu
                    </router-link>
                  </div>
                  <button 
                    v-else
                    @click="startJukebox" 
                    :disabled="!isSpotifyConnected || !defaultPlaylist"
                    :class="[
                      'px-4 py-2 rounded-lg transition-colors',
                      !isSpotifyConnected || !defaultPlaylist
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    ]"
                  >
                    Spustit jukebox
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
const donationPurpose = ref("");
const defaultPlaylist = ref(null);
const jukeboxStarted = ref(false);
const paymentQrCode = ref(null);

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
      
      // Načteme další data pro jednotlivé kroky
      await fetchJukeboxSettings();
    }
  } catch (error) {
    // Chyba při načítání uživatele
  } finally {
    isLoading.value = false;
  }
};

// Načtení nastavení jukeboxu
const fetchJukeboxSettings = async () => {
  try {
    // Načtení nastavení jukeboxu z API
    const response = await $fetch("/api/jukebox/settings", {
      method: "GET"
    });
    
    // Nastavení hodnot z odpovědi
    if (response.donationPurpose) {
      donationPurpose.value = response.donationPurpose;
    }
    
    if (response.defaultPlaylist) {
      defaultPlaylist.value = response.defaultPlaylist;
    }
    
    if (response.paymentQrCode) {
      paymentQrCode.value = response.paymentQrCode;
    }
    
    if (response.jukeboxStarted) {
      jukeboxStarted.value = response.jukeboxStarted;
    }
  } catch (error) {
    console.error("Chyba při načítání nastavení jukeboxu:", error);
    // Není kritická chyba, můžeme pokračovat s výchozími hodnotami
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

// Načteme data uživatele
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

// Nahrání QR kódu pro platby
const uploadPaymentQR = () => {
  // Vytvoření skrytého input elementu pro výběr souboru
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Vytvoření FormData pro nahrání souboru
      const formData = new FormData();
      formData.append("qrCode", file);
      
      // Nahrajeme soubor na server
      const response = await $fetch("/api/jukebox/upload-qr", {
        method: "POST",
        body: formData
      });
      
      if (response.success) {
        paymentQrCode.value = response.qrCodeUrl;
        alert("QR kód byl úspěšně nahrán!");
      }
    } catch (error) {
      console.error("Chyba při nahrávání QR kódu:", error);
      alert("Nepodařilo se nahrát QR kód. Zkuste to prosím znovu.");
    }
    
    // Odstranění input elementu
    document.body.removeChild(fileInput);
  });
  
  // Přidání input elementu do DOM a vyvolání kliknutí
  document.body.appendChild(fileInput);
  fileInput.click();
};

// Uložení účelu příspěvků
const saveDonationPurpose = async () => {
  if (!donationPurpose.value.trim()) {
    alert("Prosím zadejte účel příspěvků.");
    return;
  }
  
  try {
    const response = await $fetch("/api/jukebox/donation-purpose", {
      method: "POST",
      body: {
        purpose: donationPurpose.value
      }
    });
    
    if (response.success) {
      alert("Účel příspěvků byl úspěšně uložen!");
    }
  } catch (error) {
    console.error("Chyba při ukládání účelu příspěvků:", error);
    alert("Nepodařilo se uložit účel příspěvků. Zkuste to prosím znovu.");
  }
};

// Výběr výchozího playlistu
const selectDefaultPlaylist = async () => {
  if (!isSpotifyConnected.value) {
    alert("Nejprve se připojte ke Spotify.");
    return;
  }
  
  try {
    // Získání seznamu playlistů uživatele
    const response = await $fetch("/api/spotify/playlists", {
      method: "GET"
    });
    
    if (response.playlists && response.playlists.length > 0) {
      // Zde by bylo ideální zobrazit modal s výběrem playlistu
      // Pro jednoduchost použijeme confirm s výběrem prvního playlistu
      const firstPlaylist = response.playlists[0];
      const confirmSelection = confirm(`Chcete zvolit playlist "${firstPlaylist.name}" jako výchozí?`);
      
      if (confirmSelection) {
        defaultPlaylist.value = firstPlaylist;
        
        // Uložení vybraného playlistu
        await $fetch("/api/jukebox/default-playlist", {
          method: "POST",
          body: {
            playlistId: firstPlaylist.id,
            playlistName: firstPlaylist.name
          }
        });
        
        alert("Výchozí playlist byl úspěšně nastaven!");
      }
    } else {
      alert("Nemáte žádné dostupné playlisty. Vytvořte si nejprve playlist na Spotify.");
    }
  } catch (error) {
    console.error("Chyba při výběru playlistu:", error);
    alert("Nepodařilo se získat seznam playlistů. Zkuste to prosím znovu.");
  }
};

// Spuštění jukeboxu
const startJukebox = async () => {
  // Kontrola, zda jsou splněny všechny předchozí kroky
  if (!isSpotifyConnected.value) {
    alert("Nejprve se připojte ke Spotify (Krok 1).");
    return;
  }
  
  if (!defaultPlaylist.value) {
    alert("Nejprve vyberte výchozí playlist (Krok 4).");
    return;
  }
  
  try {
    const response = await $fetch("/api/jukebox/start", {
      method: "POST",
      body: {
        defaultPlaylistId: defaultPlaylist.value.id
      }
    });
    
    if (response.success) {
      jukeboxStarted.value = true;
      alert("Jukebox byl úspěšně spuštěn! Vaši hosté nyní mohou začít přidávat písničky.");
      
      // Přesměrování na stránku s jukeboxem
      router.push("/jukebox");
    }
  } catch (error) {
    console.error("Chyba při spouštění jukeboxu:", error);
    alert("Nepodařilo se spustit jukebox. Zkuste to prosím znovu.");
  }
};
</script>
