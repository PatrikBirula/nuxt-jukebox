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
  external_urls: {
    spotify: string;
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

    // Pro účely ukázky simulujeme získání playlistů
    // V produkční aplikaci byste museli implementovat získání a ukládání Spotify tokenů
    // po úspěšné autentizaci a autorizaci
    
    // Mock data pro ukázku
    return {
      playlists: [
        {
          id: "37i9dQZF1DX8Uebhn9wzrS",
          name: "Chill Vibes",
          images: [{ url: "https://i.scdn.co/image/ab67706f000000034ac2ef0c03cd3ca3b6e2f75f" }],
          tracks: {
            total: 50
          },
          external_urls: {
            spotify: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS"
          }
        },
        {
          id: "37i9dQZF1DX0BcQWzuB7ZO",
          name: "Dance Party",
          images: [{ url: "https://i.scdn.co/image/ab67706f00000003e7c5d32e4a6edca4ca78f034" }],
          tracks: {
            total: 40
          },
          external_urls: {
            spotify: "https://open.spotify.com/playlist/37i9dQZF1DX0BcQWzuB7ZO"
          }
        },
        {
          id: "37i9dQZF1DXaXB8fQg7xif",
          name: "Party Mix",
          images: [{ url: "https://i.scdn.co/image/ab67706f00000003b3fd47cc0490cae7bab47fcf" }],
          tracks: {
            total: 60
          },
          external_urls: {
            spotify: "https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif"
          }
        }
      ]
    };
    
  } catch (error) {
    console.error("Chyba při získávání playlistů:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se získat playlisty: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 