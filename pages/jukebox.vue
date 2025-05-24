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
            <!-- Obsah jukeboxu bude implementován později -->
            <p class="text-center text-xl">Jukebox je aktivní a připraven!</p>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Základní stav
const isLoading = ref(true);
const isAuthenticated = ref(false);
const jukeboxStarted = ref(false);
const user = useState("user", () => null);

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

// Vyčištění intervalu při opuštění stránky
onBeforeUnmount(() => {
  if (tokenRefreshInterval.value) {
    clearInterval(tokenRefreshInterval.value);
  }
});
</script>

<style scoped>
/* Zde můžete přidat vlastní styly pro jukebox */
</style> 