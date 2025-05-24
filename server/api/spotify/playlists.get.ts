import { prisma } from "~/server/utils/prisma";

// Typové definice pro Spotify API odpovědi
interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images?: { url: string }[];
  tracks: {
    total: number;
  };
}

interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  next: string | null;
  total: number;
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

    // Kontrola, zda má uživatel propojený Spotify účet
    const spotifyAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "spotify"
      }
    });

    if (!spotifyAccount) {
      throw createError({
        statusCode: 404,
        message: "Uživatel nemá propojený Spotify účet"
      });
    }

    // Kontrola expirace tokenu
    const now = Math.floor(Date.now() / 1000);
    if (spotifyAccount.expires_at && spotifyAccount.expires_at < now) {
      // Token je expirovaný, bylo by potřeba ho obnovit pomocí refresh tokenu
      // V produkční aplikaci bychom zde implementovali obnovu tokenu
      throw createError({
        statusCode: 401,
        message: "Spotify token vypršel, je nutné se znovu připojit"
      });
    }

    // Získání playlistů ze Spotify API
    const playlistsResponse = await $fetch<SpotifyPlaylistsResponse>("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `${spotifyAccount.token_type} ${spotifyAccount.access_token}`
      }
    });

    // Extrahujeme jen potřebné informace
    const playlists = playlistsResponse.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null,
      trackCount: playlist.tracks.total
    }));

    return {
      success: true,
      playlists
    };
  } catch (error) {
    console.error("Chyba při získávání Spotify playlistů:", error);
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se získat Spotify playlisty"
    });
  }
}); 