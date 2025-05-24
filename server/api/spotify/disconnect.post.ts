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

    // Kontrola, zda má uživatel propojený Spotify účet
    const spotifyAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "spotify"
      }
    });

    if (!spotifyAccount) {
      // Pokud uživatel nemá účet, vrátíme úspěch, protože už je odpojený
      return {
        success: true,
        message: "Uživatel již byl odpojen od Spotify"
      };
    }

    // Smazání Spotify účtu z databáze
    await prisma.account.delete({
      where: {
        id: spotifyAccount.id
      }
    });

    return {
      success: true,
      message: "Uživatel byl úspěšně odpojen od Spotify"
    };
  } catch (error) {
    console.error("Chyba při odpojování od Spotify:", error);
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se odpojit od Spotify"
    });
  }
}); 