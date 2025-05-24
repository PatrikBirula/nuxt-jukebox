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

    // Získání dat z požadavku
    const body = await readBody(event);
    
    if (!body.defaultPlaylistId || typeof body.defaultPlaylistId !== 'string') {
      throw createError({
        statusCode: 400,
        message: "ID výchozího playlistu nebylo specifikováno"
      });
    }

    // Označení jukeboxu jako spuštěného v databázi pro daného uživatele
    // Nejprve zjistíme, zda už existuje záznam s nastavením
    const existingSettings = await prisma.jukeboxSettings.findUnique({
      where: { userId: session.user.id }
    });
    
    if (existingSettings) {
      // Aktualizujeme existující záznam
      await prisma.jukeboxSettings.update({
        where: { id: existingSettings.id },
        data: { jukeboxStarted: true }
      });
    } else {
      // Vytvoříme nový záznam
      await prisma.jukeboxSettings.create({
        data: {
          userId: session.user.id,
          defaultPlaylistId: body.defaultPlaylistId,
          jukeboxStarted: true
        }
      });
    }
    
    return {
      success: true,
      message: "Jukebox byl úspěšně spuštěn"
    };
    
  } catch (error) {
    console.error("Chyba při spouštění jukeboxu:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se spustit jukebox: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 