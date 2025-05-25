import { ref, onMounted, onUnmounted, watch } from 'vue';

// Konstanty
const QUEUE_STORAGE_KEY = 'spotify_queue_cache';
const STORAGE_DEBOUNCE_DELAY = 1000; // 1 sekunda

export function useQueueStore() {
  // Vytvoření nebo získání globálního stavu fronty
  const queueState = useState('queueState', () => ({
    tracks: [],
    currentPlayingTrackId: null,
    lastPlayedTrackId: null,
    lastUpdated: null,
    isLoaded: false
  }));
  
  // Lokální pomocné proměnné
  const saveStorageTimeout = ref(null);
  const lastSavedQueue = ref(null);
  
  // Načtení fronty z localStorage
  const loadFromLocalStorage = () => {
    if (process.server) return; // Nespouštět na serveru
    
    try {
      const storedData = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!storedData) return;
      
      const queueData = JSON.parse(storedData);
      
      // Kontrola, zda nejsou data příliš stará (max 1 hodina)
      const isDataFresh = Date.now() - queueData.timestamp < 3600000;
      
      if (isDataFresh && queueData.tracks && queueData.tracks.length) {
        queueState.value = {
          tracks: queueData.tracks,
          currentPlayingTrackId: queueData.currentPlayingTrackId,
          lastPlayedTrackId: queueData.lastPlayedTrackId,
          lastUpdated: new Date(queueData.timestamp).toLocaleTimeString() + ' (z mezipaměti)',
          isLoaded: true
        };
        
        // Inicializujeme poslední uloženou frontu
        lastSavedQueue.value = JSON.stringify(queueData.tracks);
        
        console.log('Fronta načtena z localStorage (globální store)');
      }
    } catch (err) {
      console.error('Chyba při načítání fronty z localStorage (globální store):', err);
    }
  };
  
  // Debounced ukládání do localStorage
  const debouncedSaveToStorage = () => {
    if (process.server) return; // Nespouštět na serveru
    
    // Zrušíme předchozí timeout, pokud existuje
    if (saveStorageTimeout.value) {
      clearTimeout(saveStorageTimeout.value);
    }
    
    // Nastavíme nový timeout pro ukládání
    saveStorageTimeout.value = setTimeout(() => {
      saveToLocalStorage();
    }, STORAGE_DEBOUNCE_DELAY);
  };
  
  // Uložení fronty do localStorage
  const saveToLocalStorage = () => {
    if (process.server) return; // Nespouštět na serveru
    
    try {
      // Serializujeme aktuální frontu pro porovnání
      const currentQueueStr = JSON.stringify(queueState.value.tracks);
      
      // Pokud se fronta nezměnila od poslední uložené, neukládáme znovu
      if (lastSavedQueue.value === currentQueueStr) {
        return;
      }
      
      const queueData = {
        tracks: queueState.value.tracks,
        currentPlayingTrackId: queueState.value.currentPlayingTrackId,
        lastPlayedTrackId: queueState.value.lastPlayedTrackId,
        timestamp: Date.now()
      };
      
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueData));
      console.log('Fronta uložena do localStorage (globální store)');
      
      // Aktualizujeme poslední uloženou frontu
      lastSavedQueue.value = currentQueueStr;
    } catch (err) {
      console.error('Chyba při ukládání fronty do localStorage (globální store):', err);
    }
  };
  
  // Aktualizace fronty
  const updateQueue = (tracks, currentTrackId = null) => {
    queueState.value.tracks = tracks || [];
    
    if (currentTrackId) {
      // Pokud se změnila aktuálně přehrávaná skladba, aktualizujeme lastPlayedTrackId
      if (queueState.value.currentPlayingTrackId && 
          queueState.value.currentPlayingTrackId !== currentTrackId) {
        queueState.value.lastPlayedTrackId = queueState.value.currentPlayingTrackId;
      }
      
      queueState.value.currentPlayingTrackId = currentTrackId;
    }
    
    queueState.value.lastUpdated = new Date().toLocaleTimeString();
    queueState.value.isLoaded = true;
    
    // Ukládáme do localStorage
    debouncedSaveToStorage();
  };
  
  // Handler pro beforeunload
  const handleBeforeUnload = () => {
    // Při opuštění stránky ukládáme synchronně
    saveToLocalStorage();
  };
  
  // Přidání event listeneru pro ukládání při opuštění stránky
  onMounted(() => {
    if (process.client) { // Pouze na klientovi
      // Načtení fronty při inicializaci
      loadFromLocalStorage();
      
      // Přidání event listeneru pro beforeunload
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
  });
  
  // Odstranění event listeneru při odstranění komponenty
  onUnmounted(() => {
    if (process.client) { // Pouze na klientovi
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (saveStorageTimeout.value) {
        clearTimeout(saveStorageTimeout.value);
        saveToLocalStorage(); // Uložíme ihned při odstranění
      }
    }
  });
  
  // Sledování změn fronty
  watch(() => queueState.value, () => {
    if (process.client) { // Pouze na klientovi
      debouncedSaveToStorage();
    }
  }, { deep: true });
  
  return {
    queueState,
    updateQueue,
    loadFromLocalStorage,
    saveToLocalStorage
  };
} 