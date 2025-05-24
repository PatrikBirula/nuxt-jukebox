<template>
  <div class="background-container">
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  const updateNavbarHeight = () => {
    const navbar = document.querySelector("nav");
    if (navbar) {
      const navbarHeight = navbar.offsetHeight;
      const screenHeight = window.innerHeight;
      const backgroundEl = document.querySelector(".background-theme");

      backgroundEl.style.height = `calc(${screenHeight}px - ${navbarHeight}px)`;
    }
  };
  
  updateNavbarHeight();
  
  window.addEventListener("resize", updateNavbarHeight);
  
  onUnmounted(() => {
    window.removeEventListener("resize", updateNavbarHeight);
  });
});
</script>

<style scoped>
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background-color: #121212;
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