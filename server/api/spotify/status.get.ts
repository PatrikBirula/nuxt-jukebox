import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Kontrola, zda je uživatel přihlášený
    const sessionId = getCookie(event, "session_id");
    if (!sessionId) {
      return {
        connected: false,
        message: "Nepřihlášený uživatel"
      };
    }

    // Získání session a uživatele
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      return {
        connected: false,
        message: "Neplatná session"
      };
    }

    // Kontrola, zda má uživatel propojený Spotify účet
    const spotifyAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "spotify"
      }
    });

    if (!spotifyAccount) {
      return {
        connected: false,
        message: "Uživatel nemá propojený Spotify účet"
      };
    }

    // Kontrola expirace tokenu
    const now = Math.floor(Date.now() / 1000);
    let tokenValid = false;
    
    if (spotifyAccount.expires_at && spotifyAccount.expires_at > now) {
      tokenValid = true;
    } else if (spotifyAccount.refresh_token) {
      // Token vypršel, ale máme refresh token - můžeme ho obnovit později
      // V produkční aplikaci bychom zde obnovili token
      tokenValid = true;
    }

    return {
      connected: tokenValid,
      message: tokenValid ? "Spotify účet je propojen" : "Spotify token vypršel"
    };
  } catch (error) {
    console.error("Chyba při kontrole Spotify propojení:", error);
    return {
      connected: false,
      message: "Nepodařilo se zkontrolovat Spotify propojení"
    };
  }
}); 