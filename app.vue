<template>
  <div>
    <Navbar />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';

// Načtení existující session na začátku
onMounted(async () => {
  try {
    // Pokusíme se načíst uživatele z API
    const response = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });
    
    // Získali jsme data uživatele, nastavíme state
    if (response && response.user) {
      const userState = useState('user', () => response.user);
    } else {
      // Žádná aktivní session, nastavíme null
      const userState = useState('user', () => null);
    }
  } catch (error) {
    // Chyba nebo žádný přihlášený uživatel
    const userState = useState('user', () => null);
  }
});
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>
