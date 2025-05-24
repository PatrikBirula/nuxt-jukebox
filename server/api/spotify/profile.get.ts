import { prisma } from "~/server/utils/prisma";

// Typové definice pro Spotify API odpovědi
interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
  country?: string;
  product?: string;
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
      // Pro jednoduchost budeme předpokládat, že uživatel se musí znovu připojit
      throw createError({
        statusCode: 401,
        message: "Spotify token vypršel, je nutné se znovu připojit"
      });
    }

    // Získání profilu ze Spotify API
    const spotifyUser = await $fetch<SpotifyUserProfile>("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `${spotifyAccount.token_type} ${spotifyAccount.access_token}`
      }
    });

    return {
      success: true,
      profile: spotifyUser
    };
  } catch (error) {
    console.error("Chyba při získávání Spotify profilu:", error);
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se získat Spotify profil"
    });
  }
}); 