<template>
  <nav class="bg-white shadow-md px-6 py-4">
    <div class="container mx-auto flex items-center justify-between">
      <div class="w-1/3"></div>
      
      <div class="w-1/3 flex justify-center items-center">
        <div class="flex items-center gap-2">
          <h1 class="text-4xl font-bold text-purple-700">SongBar</h1>
        </div>
      </div>
      
      <div class="w-1/3 flex justify-end">
        <button 
          @click="showAuthModal = true" 
          class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <Icon name="material-symbols:account-circle" class="m-1 text-white text-3xl" />
        </button>
      </div>
    </div>
  </nav>
  
  <AuthModal
    :is-open="showAuthModal"
    :error="authError"
    @close="closeModal"
    @login="handleLogin"
    @register="handleRegister"
  />
</template>

<script setup>
import { ref } from "vue"

const showAuthModal = ref(false)
const authError = ref("")
const router = useRouter()
const user = useState("user")

const closeModal = () => {
  showAuthModal.value = false
  authError.value = ""
}

const handleLogin = async (credentials) => {
  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials
    })

    user.value = response.user
    showAuthModal.value = false
    router.push("/dashboard")
  } catch (error) {
    console.error("Chyba při přihlášení:", error)
    authError.value = error.data?.message || "Nepodařilo se přihlásit"
  }
}

const handleRegister = async (credentials) => {
  try {
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      body: credentials
    })

    user.value = response.user
    showAuthModal.value = false
    router.push("/dashboard")
  } catch (error) {
    console.error("Chyba při registraci:", error)
    authError.value = error.data?.message || "Nepodařilo se zaregistrovat"
  }
}
</script> 