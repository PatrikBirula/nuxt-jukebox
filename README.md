# Nuxt Jukebox

Moderní jukebox aplikace postavená na Nuxt.js, která umožňuje uživatelům přehrávat a sdílet hudbu.

## Funkce

- Přihlášení a registrace uživatelů
- Integrace se Spotify
- Sdílení a přehrávání hudby
- Moderní a responzivní design

## Technologie

- Nuxt.js 3
- PostgreSQL
- Prisma
- Docker
- Spotify API

## Požadavky

- Node.js (v18 nebo novější)
- Docker a Docker Compose
- Spotify Developer účet

## Nastavení Spotify API

1. Přejděte na [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Přihlaste se nebo vytvořte nový účet
3. Vytvořte novou aplikaci kliknutím na "Create an App"
4. Vyplňte "App name", "App description" a zaškrtněte podmínky
5. Po vytvoření aplikace klikněte na "Edit Settings"
6. V sekci "Redirect URIs" přidejte: `http://127.0.0.1:3000/api/auth/callback/spotify`
7. Uložte nastavení
8. Poznamenejte si "Client ID" a "Client Secret" pro další použití

## Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/yourusername/nuxt-jukebox.git
cd nuxt-jukebox
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte soubor `.env` a nastavte potřebné proměnné:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jukebox?schema=public"
SPOTIFY_CLIENT_ID="váš_spotify_client_id"
SPOTIFY_CLIENT_SECRET="váš_spotify_client_secret"
APP_URL="http://localhost:3000"
```

4. Spusťte databázi pomocí Docker:
```bash
docker-compose up -d
```

5. Spusťte Prisma migrace:
```bash
npx prisma migrate dev
```

6. Spusťte vývojový server:
```bash
npm run dev
```

## Vývoj

Pro spuštění vývojového serveru:
```bash
npm run dev
```

Pro sestavení produkční verze:
```bash
npm run build
```

## Licence

MIT
