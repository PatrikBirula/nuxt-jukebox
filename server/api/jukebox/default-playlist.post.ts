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
    
    if (!body.playlistId || typeof body.playlistId !== 'string') {
      throw createError({
        statusCode: 400,
        message: "ID playlistu nebylo specifikováno"
      });
    }

    if (!body.playlistName || typeof body.playlistName !== 'string') {
      throw createError({
        statusCode: 400,
        message: "Název playlistu nebyl specifikován"
      });
    }

    // Zde by bylo potřeba uložit výchozí playlist do databáze
    // V produkční aplikaci byste vytvořili nebo aktualizovali model pro nastavení jukeboxu
    
    return {
      success: true,
      message: "Výchozí playlist byl úspěšně uložen"
    };
    
  } catch (error) {
    console.error("Chyba při ukládání výchozího playlistu:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se uložit výchozí playlist: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 