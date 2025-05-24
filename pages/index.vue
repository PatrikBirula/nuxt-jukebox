<template>
  <div class="min-h-screen text-white relative overflow-hidden">
    <Background />
    <div class="container mx-auto px-4 py-16 relative z-10 text-center">
      <h1 class="text-6xl mb-12">
        <span class="inline-block" :class="{ 'animate-bounce-1': animationActive }">Podpoř</span>
        <span>, </span>
        <span class="inline-block" :class="{ 'animate-bounce-2': animationActive }">vyber</span>
        <span> a </span>
        <span class="inline-block" :class="{ 'animate-bounce-3': animationActive }">zapař</span>
        <span>.</span>
      </h1>
      <p>
        Vytvořte nezapomenutelnou atmosféru na svatbě, oslavě nebo firemní akci s SongBar – aplikací, která spojuje
        hudbu, zábavu a příspěvky na dobrou věc. Ať už chcete podporit novomanžele, charitu nebo personál, SongBar dává
        vašim hostům možnost podpořit akci přímo hudbou.
      </p>
    </div>

    <div class="container mx-auto px-4 py-16 relative z-10 text-center">
      <h2 class="text-5xl mb-12">Jak to v aplikaci funguje?</h2>
      <div class="flex justify-center items-center w-2/3 mx-auto gap-12 mb-12">
        <img
          src="~/assets/img/donate.png"
          alt="Příspěvek na akci"
          width="300"
          height="300"
          class="mx-auto rounded-lg shadow-2xl object-contain"
        />
        <p class="w-full">
          Nabij si kredit, přes QR kód anebo hoď něco do klobouku. <br />
          (Výtěžek může jít novomanželům, charitě nebo obsluze,&nbsp;to&nbsp;záleží na akci.)
        </p>
      </div>
      <div class="flex justify-center items-center w-2/3 mx-auto gap-12 mb-12">
        <img
          src="~/assets/img/song.jpg"
          alt="Vyber svůj song"
          width="300"
          height="300"
          class="mx-auto rounded-lg shadow-2xl object-contain"
        />
        <p class="w-full">Najdi svůj song, zařaď jej do fronty a sleduj, jak&nbsp;se&nbsp;rozjede.</p>
      </div>

      <div class="flex justify-center items-center w-2/3 mx-auto gap-12 mb-12">
        <img
          src="~/assets/img/party.jpg"
          alt="Užij si svou písničku"
          width="300"
          height="300"
          class="mx-auto rounded-lg shadow-2xl object-contain"
        />
        <p class="w-full">Hraje tvoje hudba. Takže žádné výmluvy – parket čeká.</p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 relative z-10 flex items-center justify-center">
      <h2 class="text-5xl text-center w-1/3">Nastavení v&nbsp;pěti&nbsp;krocích</h2>
      <ul>
        <li>1. Připoj se ke svému Spotify účtu (potřebuješ Spotify Premium)</li>
        <li>2. Chceš-li přidat účet kam hosté mohou přispívat, nahraj svůj QR kód</li>
        <li>3. Napiš hostům na co mohou přispět (novomanželům, charitě, obsluze)</li>
        <li>4. Vyber svůj playlist, který bude hrát pokud hosté nedají nic do fronty</li>
        <li>5. Spusť jukebox a nech hosty si hrát</li>
      </ul>
    </div>

    <button
      v-if="!user"
      @click="showAuthModal = true"
      class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center mx-auto text-2xl mb-12"
    >
      <span class="py-3 px-10">Připojit se</span>
    </button>

    <div v-else class="text-center mb-12">
      <router-link 
        to="/dashboard" 
        class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center justify-center text-2xl py-3 px-10"
      >
        Přejít do aplikace
      </router-link>
    </div>

    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @login="handleLogin"
      @register="handleRegister"
      :error="authError"
    />
  </div>
</template>

<script setup>
import Background from "~/components/Background.vue";

// Nastavíme layout pro tuto stránku
definePageMeta({
  layout: "themed"
});

const showAuthModal = ref(false);
const router = useRouter();
const user = useState("user");
const authError = ref("");
const animationActive = ref(true);

// Funkce pro restartování animace slov
const restartWordAnimations = () => {
  animationActive.value = false;
  // Počkat jeden frame a znovu aktivovat animace
  setTimeout(() => {
    animationActive.value = true;
  }, 50); // Krátká pauza stačí pro restart animací
};

// Spustit animaci při načtení stránky a pak každé 4 sekundy
onMounted(() => {
  restartWordAnimations();
  setInterval(restartWordAnimations, 4000);
});

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
    console.error("Chyba při přihlášení:", error);
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
    console.error("Chyba při registraci:", error);
    authError.value = error.data?.message || "Nepodařilo se zaregistrovat";
  }
};
</script>

<style scoped>
ul {
  font-size: 1.5rem;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-1 {
  animation: bounce 1s ease-in-out;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

.animate-bounce-2 {
  animation: bounce 1s ease-in-out;
  animation-delay: 1s;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

.animate-bounce-3 {
  animation: bounce 1s ease-in-out;
  animation-delay: 2s;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

@keyframes sequence-animator {
  0%,
  100% {
    opacity: 1;
  }
}

h1 {
  animation: sequence-animator 4s infinite;
  animation-timing-function: ease-in-out;
}
</style>
