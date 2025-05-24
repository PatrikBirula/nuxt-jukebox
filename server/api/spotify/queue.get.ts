import { prisma } from "~/server/utils/prisma";

// Typová definice pro odpověď Spotify API
interface SpotifyPlaybackResponse {
  item?: any;
  queue?: any[];
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
    const response = await $fetch<SpotifyPlaybackResponse>("https://api.spotify.com/v1/me/player", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`
      }
    });
    
    // Kontrola zda máme data a zda fronta existuje
    if (!response || !response.queue) {
      return { queue: [] };
    }
    
    return {
      queue: response.queue || []
    };
  } catch (error: any) {
    console.error("Chyba při získávání fronty:", error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Nepodařilo se získat frontu"
    });
  }
}); 