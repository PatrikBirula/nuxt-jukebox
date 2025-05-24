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

    // Uložení výchozího playlistu do databáze pro daného uživatele
    // Nejprve zjistíme, zda už existuje záznam s nastavením
    const existingSettings = await prisma.jukeboxSettings.findUnique({
      where: { userId: session.user.id }
    });
    
    if (existingSettings) {
      // Aktualizujeme existující záznam
      await prisma.jukeboxSettings.update({
        where: { id: existingSettings.id },
        data: {
          defaultPlaylistId: body.playlistId,
          defaultPlaylistName: body.playlistName
        }
      });
    } else {
      // Vytvoříme nový záznam
      await prisma.jukeboxSettings.create({
        data: {
          userId: session.user.id,
          defaultPlaylistId: body.playlistId,
          defaultPlaylistName: body.playlistName
        }
      });
    }
    
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