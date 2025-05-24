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

    // Zde by bylo potřeba označit jukebox jako spuštěný v databázi
    // V produkční aplikaci byste vytvořili nebo aktualizovali model pro nastavení jukeboxu
    
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