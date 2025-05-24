import { prisma } from "~/server/utils/prisma";

// Typová definice pro odpověď při vyhledávání
interface SpotifyTrackSearchResponse {
  tracks?: {
    items: any[];
  };
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

    // Získáme query parametr
    const query = getQuery(event).q as string;
    
    if (!query) {
      throw createError({
        statusCode: 400,
        message: "Chybí vyhledávací dotaz"
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

    // Provedeme vyhledávání přes Spotify API
    const response = await $fetch<SpotifyTrackSearchResponse>(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`
      }
    });
    
    return {
      tracks: response.tracks?.items || []
    };
  } catch (error: any) {
    console.error("Chyba při vyhledávání skladeb:", error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Nepodařilo se vyhledat skladby"
    });
  }
}); 