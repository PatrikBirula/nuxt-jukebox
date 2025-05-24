// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  nitro: {
    preset: "node-server",
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  icon: {
    mode: 'css',
    cssLayer: 'base'
  },
  runtimeConfig: {
    // Klíče, které jsou dostupné pouze na serveru
    sessionSecret: process.env.SESSION_SECRET,
    cookieName: "session_id",
    cookieSecret: process.env.COOKIE_SECRET,
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    },
    public: {
      // Klíče, které jsou dostupné i na klientovi
    }
  },
  app: {
    head: {
      title: "Nuxt Jukebox",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
      ]
    }
  }
})