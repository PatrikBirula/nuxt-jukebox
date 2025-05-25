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
            @input="handleSearchInput"
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
          :class="{'border-l-4 border-purple-500': isNextUpTrack(track, index)}"
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
          <div v-if="isNextUpTrack(track, index)" class="text-xs text-purple-600 font-medium">
            Následující
          </div>
        </div>
      </div>
      
      <!-- Ladící informace o frontě - zobrazí se pouze v režimu vývoje -->
      <div v-if="isDevelopment" class="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
        <div class="mb-2">
          <strong>Debug info:</strong>
          <button 
            @click="forceQueueRefresh" 
            class="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Aktualizovat frontu
          </button>
        </div>
        <div><strong>Aktuální skladba:</strong> {{ currentPlayingTrackId || 'Žádná' }}</div>
        <div><strong>Poslední přehraná:</strong> {{ lastPlayedTrackId || 'Žádná' }}</div>
        <div><strong>Počet skladeb ve frontě:</strong> {{ queuedTracks.length }}</div>
        <div><strong>Poslední aktualizace:</strong> {{ lastQueueUpdate }}</div>
      </div>
    </div>
    
    <!-- Prázdná fronta -->
    <div v-else-if="attemptedQueueLoad" class="mt-6 text-center text-gray-500">
      <p>Žádné skladby ve frontě</p>
      <button 
        @click="forceQueueRefresh" 
        class="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"
      >
        Aktualizovat frontu
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  currentTrack: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['track-added', 'error']);

// Použijeme globální queue store
const { queueState, updateQueue } = useQueueStore();

// Computed vlastnosti pro práci s frontou
const queuedTracks = computed(() => queueState.value.tracks || []);
const attemptedQueueLoad = computed(() => queueState.value.isLoaded);
const lastQueueUpdate = computed(() => queueState.value.lastUpdated || 'Zatím neaktualizováno');
const currentPlayingTrackId = computed(() => queueState.value.currentPlayingTrackId);
const lastPlayedTrackId = computed(() => queueState.value.lastPlayedTrackId);

// Stav
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const error = ref('');
const isAddingToQueue = ref(false);
const addingTrackId = ref(null);
const queueRefreshInterval = ref(null);
const searchTimeout = ref(null);
const MIN_SEARCH_CHARS = 3;
const DEBOUNCE_DELAY = 500; // ms
const isDevelopment = process.env.NODE_ENV === 'development';

// Načtení fronty při inicializaci a nastavení intervalu pro aktualizaci
onMounted(async () => {
  console.log('SongSearch komponenta inicializována');
  await fetchQueue();
  setupQueueRefresh();
});

// Ukončení intervalů při odstranění komponenty
onBeforeUnmount(() => {
  console.log('SongSearch komponenta odstraněna');
  
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value);
  }
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});

// Nastavení pravidelné aktualizace fronty
const setupQueueRefresh = () => {
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value);
  }
  
  // Aktualizace fronty každých 5 sekund
  queueRefreshInterval.value = setInterval(async () => {
    await fetchQueue();
  }, 5000);
};

// Načtení aktuální fronty
const fetchQueue = async () => {
  try {
    if (!props.deviceId) return;
    
    const response = await fetch(`/api/spotify/queue?deviceId=${props.deviceId}`);
    
    if (!response.ok) {
      console.error('Chyba při načítání fronty:', response.status);
      return;
    }
    
    const data = await response.json();
    
    // Nastavení aktuálně přehrávané skladby a aktualizace fronty v globálním store
    if (data.currently_playing && data.currently_playing.id) {
      updateQueue(
        data.queue && Array.isArray(data.queue) ? data.queue : [],
        data.currently_playing.id
      );
    } else {
      updateQueue(
        data.queue && Array.isArray(data.queue) ? data.queue : []
      );
    }
  } catch (err) {
    console.error('Chyba při načítání fronty:', err);
  }
};

// Ruční aktualizace fronty
const forceQueueRefresh = async () => {
  await fetchQueue();
};

// Debounced vyhledávání při zadávání textu
const handleSearchInput = () => {
  // Zrušíme předchozí timeout, pokud existuje
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Kontrola minimální délky pro vyhledávání
  if (searchQuery.value.length >= MIN_SEARCH_CHARS) {
    // Nastavíme nový timeout pro vyhledávání s debounce
    searchTimeout.value = setTimeout(() => {
      searchSongs();
    }, DEBOUNCE_DELAY);
  } else if (searchQuery.value.length === 0) {
    // Pokud je pole prázdné, vyčistíme výsledky
    searchResults.value = [];
  }
};

// Vyhledávání písniček
const searchSongs = async () => {
  // Zrušíme případný existující timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = null;
  }
  
  // Kontrola minimální délky pro vyhledávání
  if (searchQuery.value.length < MIN_SEARCH_CHARS) {
    if (searchQuery.value.length > 0) {
      error.value = `Pro vyhledávání zadejte alespoň ${MIN_SEARCH_CHARS} znaky`;
    }
    return;
  }
  
  if (isSearching.value) return;
  
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
        deviceId: props.deviceId,
        trackInfo: {
          id: track.id,
          name: track.name,
          artist: track.artists.map(a => a.name).join(', ')
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Nepodařilo se přidat skladbu do fronty');
    }
    
    // Po přidání skladby aktualizujeme frontu
    await fetchQueue();
    
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

// Sledování změn aktuální skladby
watch(() => props.currentTrack, (newTrack) => {
  if (newTrack) {
    // Aktualizujeme frontu
    fetchQueue();
  }
}, { immediate: true });

// Aktualizace fronty při změně deviceId
watch(() => props.deviceId, async (newDeviceId) => {
  if (newDeviceId) {
    await fetchQueue();
  }
});

// Úprava komponenty, aby správně zobrazila, zda je skladba v seznamu ta, která bude následovat
const isNextUpTrack = (track, index) => {
  // Skladba je následující, pokud je první ve frontě
  return index === 0;
};
</script>

<style scoped>
.song-search-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>