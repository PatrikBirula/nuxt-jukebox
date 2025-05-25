/**
 * Endpoint pro zjištění, zda je skladba karaoke (přidaná uživatelem)
 * GET /api/spotify/is-karaoke?uri=spotify:track:12345
 */
import { prisma } from "~/server/utils/prisma";
import { isKaraokeTrack } from "./queue.get";

export default defineEventHandler(async (event) => {
  try {
    // Kontrola, zda je uživatel přihlášený
    const sessionId = getCookie(event, "session_id");
    if (!sessionId) {
      return {
        isKaraoke: false,
        error: "Nepřihlášený uživatel"
      };
    }

    // Získání session a uživatele
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      return {
        isKaraoke: false,
        error: "Neplatná session"
      };
    }

    // Získáme URI skladby z query parametrů
    const query = getQuery(event);
    const trackUri = query.uri as string;
    
    if (!trackUri) {
      return {
        isKaraoke: false,
        error: "Chybí URI skladby"
      };
    }
    
    // Použijeme funkci pro zjištění, zda je skladba karaoke
    const isKaraoke = await isKaraokeTrack(trackUri, session.user.id);
    
    return {
      isKaraoke,
      trackUri
    };
  } catch (error: any) {
    console.error("Chyba při zjišťování, zda je skladba karaoke:", error);
    
    return {
      isKaraoke: false,
      error: error.message || "Nepodařilo se zjistit, zda je skladba karaoke"
    };
  }
}); 