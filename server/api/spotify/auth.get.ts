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

    // Spotify OAuth parametry
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) {
      throw createError({
        statusCode: 500,
        message: "Chybí SPOTIFY_CLIENT_ID v konfiguraci"
      });
    }
    const redirectUri = `${process.env.APP_URL || "http://127.0.0.1:3000"}/api/auth/callback/spotify`;
    const scope = "user-read-private user-read-email streaming user-library-read user-read-playback-state user-modify-playback-state";
    
    // Vytvoření náhodného state pro prevenci CSRF útoků
    const state = Math.random().toString(36).substring(2, 15);
    
    // Uložení state do cookie pro pozdější validaci
    setCookie(event, "spotify_auth_state", state, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10 // 10 minut
    });

    // Sestavení URL pro přesměrování na Spotify
    const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");
    spotifyAuthUrl.searchParams.append("client_id", clientId);
    spotifyAuthUrl.searchParams.append("response_type", "code");
    spotifyAuthUrl.searchParams.append("redirect_uri", redirectUri);
    spotifyAuthUrl.searchParams.append("state", state);
    spotifyAuthUrl.searchParams.append("scope", scope);

    // Přesměrování na Spotify přihlášení
    return sendRedirect(event, spotifyAuthUrl.toString());
  } catch (error) {
    console.error("Chyba při autentizaci Spotify:", error);
    throw createError({
      statusCode: 500,
      message: "Nepodařilo se připojit ke Spotify"
    });
  }
}); 