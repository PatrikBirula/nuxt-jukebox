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

    // Získání device_id z požadavku (pokud existuje)
    const body = await readBody(event);
    const deviceId = body.deviceId;

    // Definujeme URL pro pozastavení přehrávání
    let url = `https://api.spotify.com/v1/me/player/pause`;
    
    // Pokud máme device_id, přidáme ho jako parametr
    if (deviceId) {
      url += `?device_id=${deviceId}`;
    }

    // Pozastavíme přehrávání přes Spotify API
    await $fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`
      }
    });

    return {
      success: true,
      message: "Přehrávání bylo pozastaveno"
    };
  } catch (error) {
    console.error("Chyba při pozastavení přehrávání:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se pozastavit přehrávání: ${error instanceof Error ? error.message : "Neznámá chyba"}`
    });
  }
}); 