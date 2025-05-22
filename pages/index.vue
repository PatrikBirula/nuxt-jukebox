<template>
  <div class="min-h-screen text-white bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
    <div class="fog-container">
      <div class="fog fog-1"></div>
      <div class="fog fog-2"></div>
      <div class="fog fog-3"></div>
    </div>

    <div class="spotlights">
      <div class="spotlight-group spotlight-group-1">
        <div class="spotlight-head"></div>
        <div class="spotlight spotlight-1"></div>
      </div>
      <div class="spotlight-group spotlight-group-2">
        <div class="spotlight-head"></div>
        <div class="spotlight spotlight-2"></div>
      </div>
    </div>

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
.fog-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 35vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.fog {
  position: absolute;
  bottom: -50px;
  width: 350%;
  height: 100%;
  background: linear-gradient(to top, rgba(190, 149, 255, 0.25), transparent);
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.7;
}

.fog-1 {
  left: -125%;
  animation: fogMovement1 40s infinite linear;
}

.fog-2 {
  left: -125%;
  animation: fogMovement2 30s infinite linear reverse;
  opacity: 0.5;
}

.fog-3 {
  left: -100%;
  animation: fogMovement3 35s infinite linear;
  opacity: 0.6;
}

@keyframes fogMovement1 {
  0% {
    transform: translateX(-5%);
  }
  50% {
    transform: translateX(15%);
  }
  100% {
    transform: translateX(-5%);
  }
}

@keyframes fogMovement2 {
  0% {
    transform: translateX(0%);
  }
  50% {
    transform: translateX(20%);
  }
  100% {
    transform: translateX(0%);
  }
}

@keyframes fogMovement3 {
  0% {
    transform: translateX(5%);
  }
  50% {
    transform: translateX(-10%);
  }
  100% {
    transform: translateX(5%);
  }
}

.spotlights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.spotlight-group {
  position: absolute;
  transform-origin: top;
}

.spotlight-group-1 {
  top: 10px;
  left: 25%;
  transform: rotate(25deg);
  animation: spotlightMove1 10s infinite alternate ease-in-out;
}

.spotlight-group-2 {
  top: 10px;
  right: 25%;
  transform: rotate(-30deg);
  animation: spotlightMove2 12s infinite alternate ease-in-out;
}

.spotlight-head {
  position: absolute;
  width: 60px;
  height: 30px;
  background: #222;
  border-radius: 10px;
  transform: translateX(-50%);
  left: 50%;
  top: -30px;
  z-index: 2;
}

.spotlight-group-1 .spotlight-head {
  box-shadow: 0 0 10px rgba(255, 230, 100, 0.7);
  animation: headColorSwap1 12s infinite;
}

.spotlight-group-2 .spotlight-head {
  box-shadow: 0 0 10px rgba(190, 149, 255, 0.7);
  animation: headColorSwap2 12s infinite;
}

.spotlight-head::before {
  content: "";
  position: absolute;
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 50%;
  bottom: -10px;
  left: 10px;
}

.spotlight-group-1 .spotlight-head::before {
  box-shadow: inset 0 0 10px rgba(255, 230, 100, 0.7);
  animation: headInnerColorSwap1 12s infinite;
}

.spotlight-group-2 .spotlight-head::before {
  box-shadow: inset 0 0 10px rgba(190, 149, 255, 0.7);
  animation: headInnerColorSwap2 12s infinite;
}

.spotlight-head::after {
  content: "";
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  bottom: 0px;
  left: 22px;
  filter: blur(4px);
}

.spotlight-group-1 .spotlight-head::after {
  background: rgba(255, 230, 100, 0.9);
  animation: bulbColorSwap1 12s infinite, spotlightPulse 5s infinite alternate;
}

.spotlight-group-2 .spotlight-head::after {
  background: rgba(190, 149, 255, 0.9);
  animation: bulbColorSwap2 12s infinite, spotlightPulse 7s infinite alternate-reverse;
}

.spotlight {
  position: relative;
  width: 0;
  height: 0;
  border-left: 200px solid transparent;
  border-right: 200px solid transparent;
  transform-origin: top;
  filter: blur(8px);
}

.spotlight-1 {
  border-bottom: 2200px solid rgba(255, 230, 100, 0.5);
  animation: beamColorSwap1 12s infinite, spotlightPulse 5s infinite alternate;
}

.spotlight-2 {
  border-bottom: 2200px solid rgba(190, 149, 255, 0.5);
  animation: beamColorSwap2 12s infinite, spotlightPulse 7s infinite alternate-reverse;
}

@keyframes spotlightPulse {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.2;
  }
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

@keyframes spotlightMove1 {
  0% {
    transform: rotate(25deg);
  }
  100% {
    transform: rotate(15deg);
  }
}

@keyframes spotlightMove2 {
  0% {
    transform: rotate(-30deg);
  }
  100% {
    transform: rotate(-20deg);
  }
}

@keyframes headColorSwap1 {
  0%, 45% {
    box-shadow: 0 0 10px rgba(255, 230, 100, 0.7);
  }
  50%, 95% {
    box-shadow: 0 0 10px rgba(190, 149, 255, 0.7);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 230, 100, 0.7);
  }
}

@keyframes headColorSwap2 {
  0%, 45% {
    box-shadow: 0 0 10px rgba(190, 149, 255, 0.7);
  }
  50%, 95% {
    box-shadow: 0 0 10px rgba(255, 230, 100, 0.7);
  }
  100% {
    box-shadow: 0 0 10px rgba(190, 149, 255, 0.7);
  }
}

@keyframes headInnerColorSwap1 {
  0%, 45% {
    box-shadow: inset 0 0 10px rgba(255, 230, 100, 0.7);
  }
  50%, 95% {
    box-shadow: inset 0 0 10px rgba(190, 149, 255, 0.7);
  }
  100% {
    box-shadow: inset 0 0 10px rgba(255, 230, 100, 0.7);
  }
}

@keyframes headInnerColorSwap2 {
  0%, 45% {
    box-shadow: inset 0 0 10px rgba(190, 149, 255, 0.7);
  }
  50%, 95% {
    box-shadow: inset 0 0 10px rgba(255, 230, 100, 0.7);
  }
  100% {
    box-shadow: inset 0 0 10px rgba(190, 149, 255, 0.7);
  }
}

@keyframes bulbColorSwap1 {
  0%, 45% {
    background: rgba(255, 230, 100, 0.9);
  }
  50%, 95% {
    background: rgba(190, 149, 255, 0.9);
  }
  100% {
    background: rgba(255, 230, 100, 0.9);
  }
}

@keyframes bulbColorSwap2 {
  0%, 45% {
    background: rgba(190, 149, 255, 0.9);
  }
  50%, 95% {
    background: rgba(255, 230, 100, 0.9);
  }
  100% {
    background: rgba(190, 149, 255, 0.9);
  }
}

@keyframes beamColorSwap1 {
  0%, 45% {
    border-bottom-color: rgba(255, 230, 100, 0.5);
  }
  50%, 95% {
    border-bottom-color: rgba(190, 149, 255, 0.5);
  }
  100% {
    border-bottom-color: rgba(255, 230, 100, 0.5);
  }
}

@keyframes beamColorSwap2 {
  0%, 45% {
    border-bottom-color: rgba(190, 149, 255, 0.5);
  }
  50%, 95% {
    border-bottom-color: rgba(255, 230, 100, 0.5);
  }
  100% {
    border-bottom-color: rgba(190, 149, 255, 0.5);
  }
}
</style>
