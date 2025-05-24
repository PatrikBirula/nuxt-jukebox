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

    // Získání nastavení jukeboxu z databáze pro daného uživatele
    // Poznámka: V reálné aplikaci by bylo potřeba vytvořit model pro JukeboxSettings
    // Tady vracíme dočasná prázdná data pro ukázku
    
    return {
      success: true,
      donationPurpose: "", // Bude načteno z databáze
      paymentQrCode: null, // URL k obrázku QR kódu
      defaultPlaylist: null, // Informace o výchozím playlistu
      jukeboxStarted: false // Zda je jukebox spuštěn
    };
  } catch (error) {
    console.error("Chyba při získávání nastavení jukeboxu:", error);
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se získat nastavení jukeboxu"
    });
  }
}); 