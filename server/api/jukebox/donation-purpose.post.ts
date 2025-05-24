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
    
    if (!body.purpose || typeof body.purpose !== 'string') {
      throw createError({
        statusCode: 400,
        message: "Účel příspěvků nebyl specifikován"
      });
    }

    // Uložení účelu příspěvků do databáze pro daného uživatele
    // Nejprve zjistíme, zda už existuje záznam s nastavením
    const existingSettings = await prisma.jukeboxSettings.findUnique({
      where: { userId: session.user.id }
    });
    
    if (existingSettings) {
      // Aktualizujeme existující záznam
      await prisma.jukeboxSettings.update({
        where: { id: existingSettings.id },
        data: { donationPurpose: body.purpose }
      });
    } else {
      // Vytvoříme nový záznam
      await prisma.jukeboxSettings.create({
        data: {
          userId: session.user.id,
          donationPurpose: body.purpose
        }
      });
    }
    
    return {
      success: true,
      message: "Účel příspěvků byl úspěšně uložen"
    };
    
  } catch (error) {
    console.error("Chyba při ukládání účelu příspěvků:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se uložit účel příspěvků: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 