<template>
  <div>
    <ClientOnly>
      <div v-if="isLoading" class="container mx-auto px-4 py-16 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl">Načítání jukeboxu...</p>
        </div>
      </div>

      <div v-else class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-center mb-6">Spotify Jukebox</h1>
          
          <div v-if="!isAuthenticated" class="text-center py-8">
            <p class="text-xl mb-4">Pro přístup k jukeboxu se prosím přihlaste</p>
            <router-link 
              to="/dashboard" 
              class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Přejít na přihlášení
            </router-link>
          </div>
          
          <div v-else-if="!jukeboxStarted" class="text-center py-8">
            <p class="text-xl mb-4">Jukebox ještě nebyl spuštěn</p>
            <router-link 
              to="/dashboard" 
              class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Nastavit a spustit jukebox
            </router-link>
          </div>
          
          <div v-else>
            <div class="flex flex-col items-center justify-center">
              <!-- Přehrávač Spotify Web SDK -->
              <SpotifyPlayer 
                ref="spotifyPlayer"
                :playlist="playlistInfo" 
                @player-ready="handlePlayerReady"
                @player-error="handlePlayerError"
                @play-state-changed="handlePlayStateChanged"
              />
              
              <!-- Playlist info -->
              <div class="mt-8 text-center" v-if="playlistInfo">
                <p class="text-gray-600">Playlist: {{ playlistInfo.name }}</p>
              </div>

              <!-- Přidáno: Komponenta pro vyhledávání skladeb -->
              <div class="mt-10 border-t pt-8 w-full">
                <SongSearch 
                  v-if="spotifyDeviceId" 
                  :device-id="spotifyDeviceId"
                  @track-added="handleTrackAdded"
                  @error="handleSearchError"
                />
                <div v-else class="text-center text-gray-600">
                  Načítání přehrávače...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import SpotifyPlayer from "~/components/SpotifyPlayer.client.vue";
import SongSearch from "~/components/SongSearch.client.vue";

// Základní stav
const isLoading = ref(true);
const isAuthenticated = ref(false);
const jukeboxStarted = ref(false);
const user = useState("user", () => null);
const playerState = ref(null);
const isPlaying = ref(false);
const playlistInfo = ref(null);
const defaultPlaylistId = ref(null);
const spotifyPlayer = ref(null);
const spotifyDeviceId = ref(null);

// Proměnná pro uchování intervalu kontroly tokenu
const tokenRefreshInterval = ref(null);

// Funkce pro kontrolu stavu uživatele a jukeboxu
const checkStatus = async () => {
  try {
    isLoading.value = true;
    
    // Kontrola přihlášení
    const authResponse = await $fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    
    isAuthenticated.value = !!(authResponse && authResponse.user);
    
    if (isAuthenticated.value) {
      user.value = authResponse.user;
      
      // Kontrola stavu jukeboxu
      const jukeboxResponse = await $fetch("/api/jukebox/settings", {
        method: "GET"
      });
      
      jukeboxStarted.value = jukeboxResponse.jukeboxStarted || false;
      
      // Uložíme ID výchozího playlistu
      if (jukeboxResponse.defaultPlaylist) {
        defaultPlaylistId.value = jukeboxResponse.defaultPlaylist.id;
        playlistInfo.value = {
          id: jukeboxResponse.defaultPlaylist.id,
          name: jukeboxResponse.defaultPlaylist.name
        };
      }
    }
  } catch (error) {
    console.error("Chyba při kontrole stavu:", error);
    isAuthenticated.value = false;
    jukeboxStarted.value = false;
  } finally {
    isLoading.value = false;
  }
};

// Funkce pro pravidelnou kontrolu a obnovu Spotify tokenu
const setupTokenRefresh = () => {
  // Vyčistíme případný existující interval
  if (tokenRefreshInterval.value) {
    clearInterval(tokenRefreshInterval.value);
  }
  
  // Kontrola a obnova tokenu každých 30 minut (1800000 ms)
  tokenRefreshInterval.value = setInterval(async () => {
    if (isAuthenticated.value) {
      try {
        console.log("Kontrola platnosti Spotify tokenu...");
        
        // Pošleme požadavek na endpoint, který zkontroluje platnost tokenu a případně ho obnoví
        const response = await $fetch("/api/spotify/refresh-token", {
          method: "POST"
        });
        
        if (response.refreshed) {
          console.log("Spotify token byl úspěšně obnoven");
        } else {
          console.log("Spotify token je stále platný");
        }
      } catch (error) {
        console.error("Chyba při obnově Spotify tokenu:", error);
      }
    }
  }, 1800000); // 30 minut
};

// Inicializace stránky
onMounted(async () => {
  await checkStatus();
  
  // Nastavení pravidelné kontroly tokenu po načtení stránky
  if (isAuthenticated.value) {
    setupTokenRefresh();
  }
});

// Event handlery pro Spotify Player
const handlePlayerReady = (deviceId) => {
  console.log("Spotify přehrávač je připraven, ID zařízení:", deviceId);
  spotifyDeviceId.value = deviceId;
  
  // Automaticky spustíme přehrávání playlistu
  if (defaultPlaylistId.value && spotifyPlayer.value) {
    spotifyPlayer.value.playPlaylist(deviceId, defaultPlaylistId.value);
  }
};

const handlePlayerError = (errorMessage) => {
  console.error("Chyba Spotify přehrávače:", errorMessage);
};

const handlePlayStateChanged = (state) => {
  isPlaying.value = state.isPlaying;
};

// Přidáno: Nové funkce pro správu vyhledávání a fronty
const handleTrackAdded = (track) => {
  console.log("Písnička přidána do fronty:", track.name);
  // Zde můžeme implementovat notifikaci nebo jiné akce
};

const handleSearchError = (errorMessage) => {
  console.error("Chyba při vyhledávání:", errorMessage);
  // Zde můžeme implementovat zobrazení chyby uživateli
};

// Vyčištění intervalů při opuštění stránky
onBeforeUnmount(() => {
  if (tokenRefreshInterval.value) {
    clearInterval(tokenRefreshInterval.value);
  }
});
</script>

<style scoped>
/* Zde můžete přidat vlastní styly pro jukebox */
</style> 