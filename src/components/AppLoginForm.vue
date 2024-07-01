<template>
  <div
    class="text-white text-center font-bold p-4 rounded mb-4"
    v-if="alert.login_show_alert"
    :class="alert.login_alert_variant"
  >
    {{ alert.login_alert_msg }}
  </div>
  <!-- Login Form -->
  <vee-form :validation-schema="loginValidationSchema" @submit="onLogin">
    <!-- Email -->
    <div class="mb-3">
      <label class="inline-block mb-2">Email</label>
      <vee-field
        type="email"
        name="email"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Email"
      />
      <error-message class="text-red-600" name="email" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field
        type="password"
        name="password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Password"
      />
      <error-message class="text-red-600" name="password" />
    </div>
    <button
      type="submit"
      class="block w-full bg-purple-600 text-white py-2 px-3 mt-7 rounded transition hover:bg-purple-700"
      :disabled="alert.login_in_submission"
    >
      Login
    </button>
  </vee-form>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const loginValidationSchema = ref({
  email: 'required|min:3|max:50|email',
  password: 'required|min:9|max:100|excluded:password'
})

const alert = ref({
  login_in_submission: false,
  login_show_alert: false,
  login_alert_variant: 'bg-blue-500',
  login_alert_msg: 'Please wait! Your account is being created.'
})

const userStore = useUserStore()

async function onLogin(values) {
  alert.value.login_in_submission = true
  alert.value.login_show_alert = true
  alert.value.login_alert_variant = 'bg-blue-500'
  alert.value.login_alert_msg = 'Please wait! We are logging you in.'

  try {
    await userStore.authenticate(values)
  } catch (error) {
    alert.value.login_in_submission = false
    alert.value.login_alert_variant = 'bg-red-500'
    alert.value.login_alert_msg = 'Invalid login details.'
    return
  }

  alert.value.login_alert_variant = 'bg-green-500'
  alert.value.login_alert_msg = 'Success! You are now logged in.'
  window.location.reload()
}
</script>
