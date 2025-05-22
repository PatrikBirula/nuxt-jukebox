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
        <template v-if="user">
          <div class="flex items-center mr-4">
            <span class="mr-4">{{ user.value?.email }}</span>
            <button 
              @click="handleLogout" 
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Odhlásit se
            </button>
          </div>
        </template>
        <button
          v-if="!user"
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
import { ref } from "vue";

const showAuthModal = ref(false);
const authError = ref("");
const router = useRouter();
const user = useState("user");

const closeModal = () => {
  showAuthModal.value = false;
  authError.value = "";
};

const handleLogin = async credentials => {
  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    user.value = response.user;
    showAuthModal.value = false;
    router.push("/dashboard");
  } catch (error) {
    authError.value = error.data?.message || "Nepodařilo se přihlásit";
  }
};

const handleRegister = async credentials => {
  try {
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      body: credentials,
    });

    user.value = response.user;
    showAuthModal.value = false;
    router.push("/dashboard");
  } catch (error) {
    authError.value = error.data?.message || "Nepodařilo se zaregistrovat";
  }
};

const handleLogout = async () => {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST"
    });
    user.value = null;
    router.push("/");
  } catch (error) {
    // Chyba při odhlášení
  }
};
</script>
