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

    // Získání parametrů z těla požadavku
    const body = await readBody(event);
    let playlistId = body.playlistId;
    const deviceId = body.deviceId;
    const trackUri = body.trackUri;
    const positionMs = body.positionMs || 0;
    const offset = body.offset || 0;

    if (!playlistId) {
      // Pokud není playlist specifikován v požadavku, použijeme výchozí playlist z nastavení jukeboxu
      // Přímý SQL dotaz namísto Prisma klienta pro vyřešení problému s linterem
      const settings = await prisma.$queryRaw`SELECT "defaultPlaylistId" FROM "JukeboxSettings" WHERE "userId" = ${session.user.id}`;
      
      if (!settings || !settings[0] || !settings[0].defaultPlaylistId) {
        throw createError({
          statusCode: 400,
          message: "Není specifikován playlist pro přehrávání"
        });
      }
      
      playlistId = settings[0].defaultPlaylistId;
    }

    // Definujeme URL pro spuštění přehrávání
    let url = `https://api.spotify.com/v1/me/player/play`;
    
    // Pokud máme device_id, přidáme ho jako parametr
    if (deviceId) {
      url += `?device_id=${deviceId}`;
    }

    // Připravíme tělo požadavku podle toho, co chceme přehrát
    let requestBody = {};

    if (trackUri) {
      // Pokud máme URI konkrétní skladby, přehrajeme ji
      requestBody = {
        context_uri: `spotify:playlist:${playlistId}`,
        offset: {
          uri: trackUri
        },
        position_ms: positionMs
      };
    } else if (offset && offset > 0) {
      // Pokud máme offset, přehrajeme playlist od tohoto offsetu
      requestBody = {
        context_uri: `spotify:playlist:${playlistId}`,
        offset: {
          position: offset
        },
        position_ms: 0
      };
    } else {
      // Jinak přehrajeme playlist od začátku
      requestBody = {
        context_uri: `spotify:playlist:${playlistId}`,
        position_ms: 0
      };
    }

    // Spustíme přehrávání playlistu přes Spotify API
    await $fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    return {
      success: true,
      message: "Přehrávání bylo spuštěno"
    };
  } catch (error) {
    console.error("Chyba při spouštění přehrávání:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se spustit přehrávání: ${error instanceof Error ? error.message : "Neznámá chyba"}`
    });
  }
}); 