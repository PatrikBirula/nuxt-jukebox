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

// Typová definice pro odpověď při obnově tokenu
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
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
      // Token vypršel, je potřeba ho obnovit
      if (!spotifyAccount.refresh_token) {
        throw createError({
          statusCode: 401,
          message: "Chybí refresh token, je potřeba se znovu přihlásit ke Spotify"
        });
      }

      // Získání nového tokenu pomocí refresh tokenu
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw createError({
          statusCode: 500,
          message: "Chybí Spotify credentials v konfiguraci"
        });
      }

      const tokenResponse = await $fetch<SpotifyTokenResponse>("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: spotifyAccount.refresh_token
        })
      });

      // Aktualizace tokenu v databázi
      await prisma.account.update({
        where: { id: spotifyAccount.id },
        data: {
          access_token: tokenResponse.access_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
          refresh_token: tokenResponse.refresh_token || spotifyAccount.refresh_token,
          token_type: tokenResponse.token_type
        }
      });

      // Aktualizace access tokenu pro použití v API volání
      spotifyAccount.access_token = tokenResponse.access_token;
      spotifyAccount.token_type = tokenResponse.token_type;
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