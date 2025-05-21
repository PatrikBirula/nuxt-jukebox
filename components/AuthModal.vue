<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-8 w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ isLogin ? "Přihlášení" : "Registrace" }}</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <div v-if="props.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ props.error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            :class="[
              'mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
              emailError ? 'border-red-300' : 'border-gray-300'
            ]"
            @input="validateEmail"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Heslo</label>
          <input
            v-model="password"
            type="password"
            required
            :class="[
              'mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
              passwordError ? 'border-red-300' : 'border-gray-300'
            ]"
            @input="validatePassword"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>

        <button
          type="submit"
          :disabled="!isFormValid"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLogin ? "Přihlásit" : "Registrovat" }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button
          @click="toggleMode"
          class="text-blue-600 hover:text-blue-800"
        >
          {{ isLogin ? "Nemáte účet? Zaregistrujte se" : "Již máte účet? Přihlaste se" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  error: String
})

const emit = defineEmits(["close", "login", "register"])

const isLogin = ref(true)
const email = ref("")
const password = ref("")
const emailError = ref("")
const passwordError = ref("")

const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && email.value && password.value
})

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = "Email je povinný"
  } else if (!emailRegex.test(email.value)) {
    emailError.value = "Zadejte platnou emailovou adresu"
  } else {
    emailError.value = ""
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = "Heslo je povinné"
  } else if (password.value.length < 6) {
    passwordError.value = "Heslo musí mít alespoň 6 znaků"
  } else {
    passwordError.value = ""
  }
}

const close = () => {
  emailError.value = ""
  passwordError.value = ""
  email.value = ""
  password.value = ""
  emit("close")
}

const toggleMode = () => {
  emailError.value = ""
  passwordError.value = ""
  isLogin.value = !isLogin.value
}

const handleSubmit = async () => {
  try {
    validateEmail()
    validatePassword()

    if (!isFormValid.value) {
      return
    }

    if (isLogin.value) {
      emit("login", { email: email.value, password: password.value })
    } else {
      emit("register", { email: email.value, password: password.value })
    }
  } catch (err) {
    console.error(err)
  }
}
</script> 