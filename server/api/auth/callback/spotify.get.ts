import { prisma } from "~/server/utils/prisma";

// Typové definice pro Spotify API odpovědi
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
  country?: string;
  product?: string;
}

export default defineEventHandler(async (event) => {
  try {
    // Získání parametrů z URL
    const query = getQuery(event);
    const { code, state, error } = query;

    // Kontrola, zda došlo k chybě na straně Spotify
    if (error) {
      console.error("Spotify autorizační chyba:", error);
      return sendRedirect(event, "/dashboard?error=spotify_auth_failed");
    }

    // Kontrola, zda uživatel zrušil autorizaci
    if (!code || !state) {
      return sendRedirect(event, "/dashboard?error=spotify_auth_cancelled");
    }

    // Kontrola state proti CSRF
    const storedState = getCookie(event, "spotify_auth_state");
    if (state !== storedState) {
      return sendRedirect(event, "/dashboard?error=spotify_auth_invalid_state");
    }

    // Smazání cookie s auth state
    deleteCookie(event, "spotify_auth_state");

    // Kontrola, zda je uživatel přihlášený
    const sessionId = getCookie(event, "session_id");
    if (!sessionId) {
      return sendRedirect(event, "/dashboard?error=unauthorized");
    }

    // Získání session a uživatele
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      return sendRedirect(event, "/dashboard?error=invalid_session");
    }

    // Příprava dat pro výměnu kódu za tokeny
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error("Chybí Spotify credentials v konfiguraci");
      return sendRedirect(event, "/dashboard?error=spotify_configuration_error");
    }

    const redirectUri = `${process.env.APP_URL || "http://127.0.0.1:3000"}/api/auth/callback/spotify`;

    // Výměna kódu za tokeny
    const tokenResponse = await $fetch<SpotifyTokenResponse>("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code.toString(),
        redirect_uri: redirectUri
      })
    });

    // Získání informací o Spotify uživateli
    const spotifyUser = await $fetch<SpotifyUserProfile>("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
      }
    });

    // Uložení nebo aktualizace Spotify účtu v databázi
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "spotify",
          providerAccountId: spotifyUser.id
        }
      },
      create: {
        provider: "spotify",
        providerAccountId: spotifyUser.id,
        type: "oauth",
        userId: session.user.id,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope
      },
      update: {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope
      }
    });

    // Přesměrování zpět na dashboard
    return sendRedirect(event, "/dashboard?spotify_connected=true");
  } catch (error) {
    console.error("Chyba při zpracování Spotify callbacku:", error);
    return sendRedirect(event, "/dashboard?error=spotify_callback_error");
  }
}); 