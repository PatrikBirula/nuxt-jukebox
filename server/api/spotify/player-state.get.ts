import { prisma } from "~/server/utils/prisma";

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

    // Kontrola platnosti tokenu
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
          refresh_token: tokenResponse.refresh_token || spotifyAccount.refresh_token
        }
      });

      // Aktualizace access tokenu pro použití v API volání
      spotifyAccount.access_token = tokenResponse.access_token;
    }

    // Získání stavu přehrávače
    try {
      const playerState = await $fetch(`https://api.spotify.com/v1/me/player`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${spotifyAccount.access_token}`
        }
      });

      // Vrátíme stav přehrávače
      return {
        success: true,
        playerState
      };
    } catch (error) {
      // Pokud získání stavu selže, vrátíme prázdný stav
      return {
        success: false,
        playerState: null,
        message: "Nepodařilo se získat stav přehrávače. Je Spotify spuštěný a aktivní?"
      };
    }
  } catch (error) {
    console.error("Chyba při získávání stavu přehrávače:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se získat stav přehrávače: ${error instanceof Error ? error.message : "Neznámá chyba"}`
    });
  }
}); 