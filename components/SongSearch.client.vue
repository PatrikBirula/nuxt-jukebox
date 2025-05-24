<template>
  <div class="song-search-container">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-center mb-3">Vyhledat a přidat písničku</h2>
      
      <!-- Vyhledávací formulář -->
      <div class="flex items-center space-x-2">
        <div class="relative flex-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Hledat písničku..." 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            @keyup.enter="searchSongs"
          />
          <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg class="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <button 
          @click="searchSongs"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          :disabled="isSearching || !searchQuery"
        >
          Hledat
        </button>
      </div>
      
      <!-- Chybová hláška -->
      <div v-if="error" class="mt-2 text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
    
    <!-- Výsledky vyhledávání -->
    <div v-if="searchResults.length > 0" class="mt-4">
      <h3 class="text-lg font-medium mb-2">Výsledky vyhledávání</h3>
      <div class="space-y-3 max-h-[400px] overflow-y-auto">
        <div 
          v-for="track in searchResults" 
          :key="track.id" 
          class="bg-white p-3 rounded-lg shadow flex items-center space-x-3 hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0 w-12 h-12">
            <img 
              v-if="track.album && track.album.images && track.album.images.length > 0"
              :src="track.album.images[track.album.images.length > 2 ? 2 : 0].url" 
              :alt="track.album.name" 
              class="w-full h-full object-cover rounded"
            />
            <div v-else class="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ track.name }}</p>
            <p class="text-sm text-gray-500 truncate">{{ track.artists.map(a => a.name).join(', ') }}</p>
          </div>
          <div>
            <button 
              @click="addToQueue(track)"
              class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              :disabled="isAddingToQueue"
            >
              <span v-if="isAddingToQueue && addingTrackId === track.id">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span v-else>Přidat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fronta -->
    <div v-if="queuedTracks.length > 0" class="mt-6">
      <h3 class="text-lg font-medium mb-2 flex items-center">
        <span>Fronta písniček</span>
        <span class="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">{{ queuedTracks.length }}</span>
      </h3>
      <div class="space-y-2 max-h-[300px] overflow-y-auto">
        <div 
          v-for="(track, index) in queuedTracks" 
          :key="track.id" 
          class="bg-white p-2 rounded-lg shadow flex items-center space-x-3"
          :class="{'border-l-4 border-purple-500': index === 0}"
        >
          <div class="flex-shrink-0 w-10 h-10">
            <img 
              v-if="track.album && track.album.images && track.album.images.length > 0"
              :src="track.album.images[track.album.images.length > 2 ? 2 : 0].url" 
              :alt="track.album.name" 
              class="w-full h-full object-cover rounded"
            />
            <div v-else class="w-full h-full bg-gray-200 rounded"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ track.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ track.artists.map(a => a.name).join(', ') }}</p>
          </div>
          <div v-if="index === 0" class="text-xs text-purple-600 font-medium">
            Následující
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['track-added', 'error']);

// Stav
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const error = ref('');
const queuedTracks = ref([]);
const isAddingToQueue = ref(false);
const addingTrackId = ref(null);

// Načtení fronty při inicializaci
onMounted(async () => {
  await fetchQueue();
});

// Vyhledávání písniček
const searchSongs = async () => {
  if (!searchQuery.value || isSearching.value) return;
  
  try {
    isSearching.value = true;
    error.value = '';
    
    const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery.value)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Nepodařilo se vyhledat písničky');
    }
    
    searchResults.value = data.tracks || [];
    
    if (searchResults.value.length === 0) {
      error.value = 'Nenalezeny žádné písničky. Zkuste upravit vyhledávací dotaz.';
    }
  } catch (err) {
    console.error('Chyba při vyhledávání:', err);
    error.value = err.message || 'Nepodařilo se vyhledat písničky';
    emit('error', error.value);
  } finally {
    isSearching.value = false;
  }
};

// Přidání skladby do fronty
const addToQueue = async (track) => {
  if (isAddingToQueue.value) return;
  
  try {
    isAddingToQueue.value = true;
    addingTrackId.value = track.id;
    error.value = '';
    
    const response = await fetch('/api/spotify/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trackUri: track.uri,
        deviceId: props.deviceId
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Nepodařilo se přidat skladbu do fronty');
    }
    
    // Přidáme track do naší lokální fronty
    const isAlreadyInQueue = queuedTracks.value.some(t => t.id === track.id);
    if (!isAlreadyInQueue) {
      queuedTracks.value.push(track);
    }
    
    // Informujeme rodiče
    emit('track-added', track);
    
    // Vyčistíme vyhledávání
    searchQuery.value = '';
    searchResults.value = [];
    
  } catch (err) {
    console.error('Chyba při přidávání do fronty:', err);
    error.value = err.message || 'Nepodařilo se přidat skladbu do fronty';
    emit('error', error.value);
  } finally {
    isAddingToQueue.value = false;
    addingTrackId.value = null;
  }
};

// Načtení aktuální fronty
const fetchQueue = async () => {
  try {
    const response = await fetch(`/api/spotify/queue?deviceId=${props.deviceId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Nepodařilo se načíst frontu');
    }
    
    queuedTracks.value = data.queue || [];
  } catch (err) {
    console.error('Chyba při načítání fronty:', err);
    // Pouze logujeme, nezobrazujeme uživateli chybu při inicializaci
  }
};

// Aktualizace fronty při změně deviceId
watch(() => props.deviceId, async (newDeviceId) => {
  if (newDeviceId) {
    await fetchQueue();
  }
});
</script>

<style scoped>
.song-search-container {
  max-width: 600px;
  margin: 0 auto;
}
</style> 