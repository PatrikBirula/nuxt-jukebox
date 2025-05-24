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
    const settings = await prisma.jukeboxSettings.findUnique({
      where: { userId: session.user.id }
    });
    
    // Pokud nemáme žádná nastavení, vrátíme výchozí hodnoty
    if (!settings) {
      return {
        donationPurpose: "",
        paymentQrCode: null,
        defaultPlaylist: null,
        jukeboxStarted: false
      };
    }
    
    // Vrátíme nastavení z databáze
    return {
      donationPurpose: settings.donationPurpose || "",
      paymentQrCode: settings.paymentQrCodeUrl,
      defaultPlaylist: settings.defaultPlaylistId ? {
        id: settings.defaultPlaylistId,
        name: settings.defaultPlaylistName || "Výchozí playlist"
      } : null,
      jukeboxStarted: settings.jukeboxStarted
    };
    
  } catch (error) {
    console.error("Chyba při načítání nastavení jukeboxu:", error);
    throw createError({
      statusCode: 500,
      message: `Nepodařilo se načíst nastavení jukeboxu: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
  }
}); 