import { prisma } from "~/server/utils/prisma";

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

    // Získáme data z požadavku
    const body = await readBody(event);
    
    if (!body.trackUri) {
      throw createError({
        statusCode: 400,
        message: "Chybí URI skladby"
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

    // Přidáme skladbu do fronty přes Spotify API
    let url = `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(body.trackUri)}`;
    
    // Pokud je zadáno device ID, použijeme ho
    if (body.deviceId) {
      url += `&device_id=${body.deviceId}`;
    }

    await $fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${spotifyAccount.access_token}`
      }
    });
    
    return {
      success: true,
      message: "Skladba byla přidána do fronty"
    };
  } catch (error: any) {
    console.error("Chyba při přidávání skladby do fronty:", error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Nepodařilo se přidat skladbu do fronty"
    });
  }
}); 