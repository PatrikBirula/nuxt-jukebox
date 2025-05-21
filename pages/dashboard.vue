<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Dashboard</h1>
          <button
            @click="handleLogout"
            class="text-red-600 hover:text-red-800 font-medium"
          >
            Odhlásit se
          </button>
        </div>
        
        <div v-if="!isSpotifyConnected" class="text-center py-8">
          <p class="text-gray-600 mb-4">Pro plné využití aplikace se připojte ke Spotify</p>
          <button
            @click="connectSpotify"
            class="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Připojit Spotify
          </button>
        </div>

        <div v-else class="space-y-4">
          <h2 class="text-xl font-semibold">Připojeno ke Spotify</h2>
          <!-- TODO: Přidat další obsah dashboardu -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isSpotifyConnected = ref(false)
const router = useRouter()
const user = useState("user")

const handleLogout = async () => {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST"
    })
    
    user.value = null
    router.push("/")
  } catch (error) {
    console.error("Chyba při odhlášení:", error)
  }
}

const connectSpotify = () => {
  // TODO: Implementovat Spotify OAuth
  console.log("Připojování ke Spotify...")
}
</script> 