import { prisma } from "~/server/utils/prisma";

// Typová definice pro odpověď Spotify API
interface SpotifyQueueResponse {
  currently_playing: any;
  queue: any[];
}

export default defineEventHandler(async (event) => {
  try {
    // Kontrola, zda je uživatel přihlášený
    const sessionId = getCookie(event, "session_id");
    if (!sessionId) {
      throw createError({
        statusCode: 401,
        message: "Nepřihlášený uživatel"
      });
    }

    // Získání session a uživatele
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        message: "Neplatná session"
      });
    }

    // Získání Spotify účtu uživatele
    const spotifyAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "spotify"
      }
    });

    if (!spotifyAccount) {
      throw createError({
        statusCode: 401,
        message: "Uživatel nemá propojený Spotify účet"
      });
    }

    // Získáme aktuální frontu přes Spotify API
    const response = await $fetch<SpotifyQueueResponse>("https://api.spotify.com/v1/me/player/queue", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`
      }
    });
    
    // Zkontrolujeme, zda má odpověď očekávaný formát
    if (!response) {
      console.error("Prázdná odpověď z API");
      return { currently_playing: null, queue: [] };
    }
    
    // Načteme karaoke skladby uživatele z databáze
    const karaokeTracks = await (prisma as any).karaokeTrack.findMany({
      where: {
        userId: session.user.id
      }
    });
    
    // Vytvoříme mapu URI karaoke skladeb pro rychlé vyhledávání
    const karaokeTrackMap = new Map();
    karaokeTracks.forEach((track: any) => {
      karaokeTrackMap.set(track.trackUri, track);
    });
    
    // Pokud máme aktuálně přehrávanou skladbu, zkontrolujeme, zda je to karaoke
    if (response.currently_playing && response.currently_playing.uri) {
      const currentTrackUri = response.currently_playing.uri;
      const karaokeTrack = karaokeTrackMap.get(currentTrackUri);
      
      // Pokud je to karaoke skladba a není označena jako přehraná, označíme ji
      if (karaokeTrack && !karaokeTrack.isPlayed) {
        await (prisma as any).karaokeTrack.update({
          where: { id: karaokeTrack.id },
          data: { isPlayed: true }
        });
        
        console.log(`Označena skladba jako přehraná: ${currentTrackUri}`);
      }
    }
    
    // Vytvoříme set URI skladeb, které jsou v aktuální frontě
    const queueTrackUris = new Set();
    if (response.queue && Array.isArray(response.queue)) {
      response.queue.forEach(track => {
        if (track.uri) {
          queueTrackUris.add(track.uri);
        }
      });
    }
    
    // Označíme skladby jako přehrané, pokud již nejsou ve frontě a nebyly označeny jako přehrané
    for (const track of karaokeTracks) {
      if (!track.isPlayed && !queueTrackUris.has(track.trackUri) && response.currently_playing?.uri !== track.trackUri) {
        await (prisma as any).karaokeTrack.update({
          where: { id: track.id },
          data: { isPlayed: true }
        });
        
        console.log(`Označena skladba jako přehraná (není ve frontě): ${track.trackUri}`);
      }
    }
    
    // Filtrujeme skladby v odpovědi - chceme pouze ty přidané uživateli (karaoke), které nejsou přehrané
    const filteredQueue = Array.isArray(response.queue) 
      ? response.queue.filter(track => {
          if (!track.uri) return false;
          
          const karaokeTrack = karaokeTrackMap.get(track.uri);
          return karaokeTrack && !karaokeTrack.isPlayed;
        })
      : [];
    
    // Zpracujeme odpověď
    return {
      currently_playing: response.currently_playing || null,
      queue: filteredQueue
    };
    
  } catch (error: any) {
    console.error("Chyba při získávání fronty:", error);
    
    // Pokud je chyba 403 nebo 404, vrátíme prázdnou frontu místo chyby
    if (error.statusCode === 403 || error.statusCode === 404) {
      return { 
        currently_playing: null, 
        queue: [] 
      };
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Nepodařilo se získat frontu"
    });
  }
});

// Funkce pro kontrolu, zda je skladba karaoke (z databáze)
export async function isKaraokeTrack(trackUri: string, userId: string): Promise<boolean> {
  try {
    const track = await (prisma as any).karaokeTrack.findFirst({
      where: {
        trackUri,
        userId,
        isPlayed: false
      }
    });
    
    return !!track;
  } catch (error) {
    console.error("Chyba při kontrole karaoke skladby:", error);
    return false;
  }
} 