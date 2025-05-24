<template>
  <div class="spotify-player-container">
    <div v-if="!playerReady" class="text-center py-4">
      <p class="mb-4">Inicializace přehrávače...</p>
      <div class="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
    
    <div v-else-if="error" class="text-center py-4 text-red-600">
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <!-- Přehrávač -->
      <div class="flex flex-col items-center">
        <!-- Informace o aktuální skladbě -->
        <div v-if="currentTrack" class="mb-6 text-center">
          <div v-if="currentTrack.album.images && currentTrack.album.images.length > 0" class="mb-4">
            <img 
              :src="currentTrack.album.images[0].url" 
              alt="Album Cover" 
              class="w-48 h-48 mx-auto rounded-lg shadow-lg object-cover"
            />
          </div>
          
          <h2 class="text-2xl font-bold mt-2">{{ currentTrack.name }}</h2>
          <p class="text-gray-600">
            {{ currentTrack.artists.map(artist => artist.name).join(', ') }}
          </p>
          
          <!-- Progress bar -->
          <div class="w-full max-w-md mx-auto mt-4">
            <div class="flex justify-between text-sm text-gray-500 mb-1">
              <span>{{ formatTime(position) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-purple-600 h-2.5 rounded-full" 
                :style="{ width: `${(position / duration) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Ovládací tlačítka -->
        <div class="flex space-x-4 justify-center">
          <button 
            @click="togglePlay" 
            class="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            :disabled="!playerReady"
          >
            <span v-if="isPlaying">Zastavit</span>
            <span v-else>Přehrát</span>
          </button>
        </div>
        
        <!-- Wake Lock status -->
        <div class="mt-4 text-sm text-gray-500" v-if="wakeLockSupported">
          <p v-if="wakeLockActive" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Zařízení zůstane vzhůru během přehrávání
          </p>
          <p v-else>
            <span v-if="isPlaying" class="text-yellow-600">Aktivuji režim proti spánku...</span>
            <span v-else class="text-gray-400">Režim proti spánku není aktivní</span>
          </p>
        </div>
        
        <!-- Pokračování přehrávání -->
        <div v-if="resumeInfo" class="mt-4 text-sm text-gray-500">
          <p class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            Pokračování v přehrávání od poslední relace
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['player-ready', 'player-error', 'play-state-changed']);

// Stav přehrávače
const player = ref(null);
const playerReady = ref(false);
const isPlaying = ref(false);
const error = ref(null);
const currentTrack = ref(null);
const position = ref(0);
const duration = ref(0);
const positionInterval = ref(null);
const currentTrackIndex = ref(0);
const resumeInfo = ref(null);
const scriptLoaded = ref(false);

// Wake Lock API
const wakeLock = ref(null);
const wakeLockSupported = ref(false);
const wakeLockActive = ref(false);

// Formátování času ve formátu mm:ss
const formatTime = (ms) => {
  if (!ms) return '0:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Inicializace Web Playback SDK
const initPlayer = () => {
  if (window.Spotify) {
    createPlayer();
    return;
  }

  // Nejprve nastavíme globální callback pro SDK
  window.onSpotifyWebPlaybackSDKReady = () => {
    scriptLoaded.value = true;
    createPlayer();
  };
  
  // Potom načteme script
  loadSpotifyScript().catch(err => {
    error.value = "Nepodařilo se načíst Spotify SDK: " + err.message;
    emit('player-error', error.value);
  });
};

// Načtení Spotify Web Playback SDK
const loadSpotifyScript = () => {
  return new Promise((resolve, reject) => {
    // Kontrola, zda script již nebyl načten
    if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      if (scriptLoaded.value) {
        resolve();
      } else {
        // Script je načten, ale callback ještě nebyl zavolán
        const checkInterval = setInterval(() => {
          if (scriptLoaded.value) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = (err) => {
      reject(err);
    };
    
    document.body.appendChild(script);
  });
};

// Vytvoření Spotify přehrávače
const createPlayer = async () => {
  try {
    // Získání tokenu
    const response = await fetch('/api/spotify/player-token');
    const data = await response.json();
    
    if (!data.token) {
      throw new Error("Nepodařilo se získat přístupový token");
    }
    
    player.value = new window.Spotify.Player({
      name: 'Spotify Jukebox Web Player',
      getOAuthToken: cb => { cb(data.token); },
      volume: 0.5
    });
    
    // Error handling
    player.value.addListener('initialization_error', ({ message }) => {
      error.value = "Chyba inicializace: " + message;
      emit('player-error', error.value);
    });
    
    player.value.addListener('authentication_error', ({ message }) => {
      error.value = "Chyba autentizace: " + message;
      emit('player-error', error.value);
    });
    
    player.value.addListener('account_error', ({ message }) => {
      error.value = "Chyba účtu: " + message;
      emit('player-error', error.value);
    });
    
    player.value.addListener('playback_error', ({ message }) => {
      error.value = "Chyba přehrávání: " + message;
      emit('player-error', error.value);
    });
    
    // Playback status updates
    player.value.addListener('player_state_changed', state => {
      if (!state) return;
      
      currentTrack.value = state.track_window.current_track;
      isPlaying.value = !state.paused;
      position.value = state.position;
      duration.value = state.duration;
      
      // Ukládáme aktuální stav přehrávání
      savePlaybackState(state);
      
      emit('play-state-changed', {
        isPlaying: isPlaying.value,
        currentTrack: currentTrack.value
      });
    });
    
    // Ready
    player.value.addListener('ready', ({ device_id }) => {
      console.log('Spotify Web Playback SDK připraven, ID zařízení:', device_id);
      playerReady.value = true;
      emit('player-ready', device_id);
      
      // Nastavení intervalu pro aktualizaci pozice přehrávání
      setupPositionUpdate();
      
      // Načtení předchozího stavu přehrávání a pokračování
      checkPreviousPlaybackState(device_id);
    });
    
    // Not Ready
    player.value.addListener('not_ready', ({ device_id }) => {
      console.log('Zařízení se stalo neaktivním:', device_id);
    });
    
    // Connect to the player
    player.value.connect();
    
  } catch (err) {
    error.value = "Chyba při inicializaci přehrávače: " + err.message;
    emit('player-error', error.value);
  }
};

// Uložení stavu přehrávání do localStorage
const savePlaybackState = (state) => {
  if (!state || !state.track_window || !state.track_window.current_track) return;
  
  try {
    const playbackState = {
      playlistId: props.playlist.id,
      trackUri: state.track_window.current_track.uri,
      trackId: state.track_window.current_track.id,
      trackName: state.track_window.current_track.name,
      position: state.position,
      timestamp: Date.now(),
      trackIndex: findTrackIndex(state.track_window.current_track, state.track_window),
      nextTrackUri: state.track_window.next_tracks.length > 0 
        ? state.track_window.next_tracks[0].uri 
        : null
    };
    
    localStorage.setItem('spotify_playback_state', JSON.stringify(playbackState));
    
    // Aktualizujeme index aktuální skladby
    if (playbackState.trackIndex !== null) {
      currentTrackIndex.value = playbackState.trackIndex;
    }
  } catch (err) {
    console.error('Chyba při ukládání stavu přehrávání:', err);
  }
};

// Najít index aktuální skladby v playlistu
const findTrackIndex = (currentTrack, trackWindow) => {
  if (!trackWindow || !currentTrack) return null;
  
  // Spotify Web Playback SDK nám poskytuje předchozí, aktuální a následující skladby
  const previousTracksCount = trackWindow.previous_tracks ? trackWindow.previous_tracks.length : 0;
  
  return previousTracksCount;
};

// Načtení předchozího stavu přehrávání a pokračování
const checkPreviousPlaybackState = async (deviceId) => {
  try {
    const storedState = localStorage.getItem('spotify_playback_state');
    if (!storedState) return;
    
    const playbackState = JSON.parse(storedState);
    
    // Kontrola, zda je stav pro aktuální playlist
    if (playbackState.playlistId !== props.playlist.id) {
      localStorage.removeItem('spotify_playback_state');
      return;
    }
    
    // Nastavení informace o pokračování
    resumeInfo.value = {
      trackName: playbackState.trackName,
      position: playbackState.position
    };
    
    // Přehraj skladbu od uložené pozice nebo následující skladbu
    try {
      const offsetMs = playbackState.position;
      const offsetTooOld = Date.now() - playbackState.timestamp > 3600000; // 1 hodina
      
      if (offsetTooOld || !playbackState.trackUri) {
        // Pokud je pozice příliš stará nebo nemáme URI skladby, přehraj následující skladbu
        if (playbackState.nextTrackUri) {
          await playSpecificTrack(deviceId, props.playlist.id, playbackState.nextTrackUri, 0);
        } else {
          // Pokud nemáme ani následující skladbu, začni od začátku playlistu s offsetem
          await playPlaylist(deviceId, props.playlist.id, playbackState.trackIndex + 1);
        }
      } else {
        // Pokračuj ve stejné skladbě od uložené pozice
        await playSpecificTrack(deviceId, props.playlist.id, playbackState.trackUri, offsetMs);
      }
    } catch (err) {
      console.error('Chyba při pokračování v přehrávání:', err);
      // Pokud selhalo pokračování, spustíme playlist od začátku
      await playPlaylist(deviceId, props.playlist.id);
    }
  } catch (err) {
    console.error('Chyba při kontrole předchozího stavu přehrávání:', err);
  }
};

// Přehrání konkrétní skladby v playlistu
const playSpecificTrack = async (deviceId, playlistId, trackUri, positionMs = 0) => {
  if (!playerReady.value) return;
  
  try {
    await fetch('/api/spotify/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playlistId,
        deviceId,
        trackUri,
        positionMs
      }),
    });
  } catch (err) {
    console.error('Chyba při přehrávání konkrétní skladby:', err);
    error.value = "Nepodařilo se přehrát konkrétní skladbu";
    throw err;
  }
};

// Nastavení intervalu pro aktualizaci pozice přehrávání
const setupPositionUpdate = () => {
  if (positionInterval.value) {
    clearInterval(positionInterval.value);
  }
  
  positionInterval.value = setInterval(() => {
    if (isPlaying.value && position.value < duration.value) {
      position.value += 1000; // Přičítáme 1 sekundu (1000 ms)
    }
  }, 1000);
};

// Přepínání přehrávání
const togglePlay = async () => {
  if (!playerReady.value || !player.value) return;
  
  try {
    const result = await player.value.togglePlay();
    console.log('Přepnutí přehrávání:', result);
  } catch (err) {
    console.error('Chyba při přepínání přehrávání:', err);
  }
};

// Přehrání playlistu
const playPlaylist = async (deviceId, playlistId, offset = 0) => {
  if (!playerReady.value) return;
  
  try {
    await fetch('/api/spotify/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playlistId,
        deviceId,
        offset
      }),
    });
  } catch (err) {
    console.error('Chyba při přehrávání playlistu:', err);
    error.value = "Nepodařilo se přehrát playlist";
    throw err;
  }
};

// Funkce pro zamknutí obrazovky (zabránění spánku)
const requestWakeLock = async () => {
  if (!wakeLockSupported.value || wakeLockActive.value) return;
  
  try {
    wakeLock.value = await navigator.wakeLock.request('screen');
    wakeLockActive.value = true;
    
    console.log('Wake Lock je aktivní');
    
    wakeLock.value.addEventListener('release', () => {
      console.log('Wake Lock byl uvolněn');
      wakeLockActive.value = false;
      wakeLock.value = null;
    });
  } catch (err) {
    console.error('Nepodařilo se aktivovat Wake Lock:', err);
    wakeLockActive.value = false;
  }
};

// Funkce pro uvolnění zámku obrazovky
const releaseWakeLock = async () => {
  if (wakeLock.value) {
    try {
      await wakeLock.value.release();
      wakeLock.value = null;
      wakeLockActive.value = false;
      console.log('Wake Lock byl manuálně uvolněn');
    } catch (err) {
      console.error('Nepodařilo se uvolnit Wake Lock:', err);
    }
  }
};

// Kontrola, zda je Wake Lock API podporované
const checkWakeLockSupport = () => {
  wakeLockSupported.value = 'wakeLock' in navigator && 
                            navigator.wakeLock && 
                            typeof navigator.wakeLock.request === 'function';
  console.log('Wake Lock API podporováno:', wakeLockSupported.value);
};

// Inicializace přehrávače při načtení komponenty
onMounted(() => {
  initPlayer();
  checkWakeLockSupport();
  
  // Přidání event listenerů pro obnovení Wake Lock při návratu na stránku
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isPlaying.value) {
      await requestWakeLock();
    }
  });
});

// Sledování stavu přehrávání pro automatické zamknutí/odemknutí obrazovky
watch(isPlaying, async (newValue) => {
  if (wakeLockSupported.value) {
    if (newValue) {
      // Přehrávání začalo - aktivujeme Wake Lock
      await requestWakeLock();
    } else {
      // Přehrávání skončilo - uvolníme Wake Lock
      await releaseWakeLock();
    }
  }
});

// Čištění při odstranění komponenty
onBeforeUnmount(() => {
  if (player.value) {
    player.value.disconnect();
  }
  
  if (positionInterval.value) {
    clearInterval(positionInterval.value);
  }
  
  // Uvolníme Wake Lock při opuštění komponenty
  releaseWakeLock();
});

// Exportujeme metody, které budou dostupné z rodičovské komponenty
defineExpose({
  playPlaylist
});
</script>

<style scoped>
.spotify-player-container {
  min-height: 300px;
}
</style> 