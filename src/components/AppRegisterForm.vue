<template>
  <!-- Registration Form -->
  <div
    class="text-white text-center font-bold p-4 rounded mb-4"
    v-if="alert.reg_show_alert"
    :class="alert.reg_alert_variant"
  >
    {{ alert.reg_alert_msg }}
  </div>
  <vee-form
    :validation-schema="regisValidationSchema"
    :initial-values="userData"
    @submit="onRegister"
  >
    <!-- Name -->
    <div class="flex gap-3 mb-3">
      <div class="w-full">
        <label class="inline-block mb-2">First Name</label>
        <vee-field
          type="text"
          name="first_name"
          class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          placeholder="Enter Your First Name"
        />
        <error-message class="text-red-600" name="first_name" />
      </div>
      <div class="w-full">
        <label class="inline-block mb-2">Last Name</label>
        <vee-field
          type="text"
          name="last_name"
          class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          placeholder="Enter Your Last Name"
        />
        <error-message class="text-red-600" name="last_name" />
      </div>
    </div>
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
    <!-- Age -->
    <div class="mb-3">
      <label class="inline-block mb-2">Age</label>
      <vee-field
        type="number"
        name="age"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      />
      <error-message class="text-red-600" name="age" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field name="password" :bails="false" v-slot="{ field, errors }">
        <input
          type="password"
          class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          placeholder="Password"
          v-bind="field"
        />
        <div class="text-red-600" v-for="(error, index) in errors" :key="index">
          {{ error }}
        </div>
      </vee-field>
    </div>
    <!-- Confirm Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Confirm Password</label>
      <vee-field
        type="password"
        name="confirm_password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Confirm Password"
      />
      <error-message class="text-red-600" name="confirm_password" />
    </div>
    <!-- Country -->
    <div class="mb-3">
      <label class="inline-block mb-2">Country</label>
      <vee-field
        as="select"
        name="country"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      >
        <option value="USA">USA</option>
        <option value="Mexico">Mexico</option>
        <option value="Germany">Germany</option>
        <option value="Indonesia">Indonesia</option>
        <option value="Japan">Japan</option>
      </vee-field>
      <error-message class="text-red-600" name="country" />
    </div>
    <!-- TOS -->
    <div class="mb-3 pl-6">
      <vee-field
        name="tos"
        value="1"
        type="checkbox"
        class="w-4 h-4 float-left -ml-6 mt-1 rounded"
      />
      <label class="inline-block">Accept terms of service</label>
      <error-message class="block text-red-600" name="tos" />
    </div>
    <button
      type="submit"
      class="block w-full bg-purple-600 text-white py-2 px-3 rounded transition hover:bg-purple-700"
      :disabled="alert.reg_in_submission"
    >
      Submit
    </button>
  </vee-form>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const regisValidationSchema = ref({
  first_name: 'required|min:3|max:25|alpha_spaces',
  last_name: 'required|min:3|max:25|alpha_spaces',
  email: 'required|min:3|max:50|email',
  age: 'required|min_value:18|max_value:100',
  password: 'required|min:9|max:100|excluded:password',
  confirm_password: 'required|password_mismatch:@password',
  country: 'required',
  tos: 'tos'
})

const userData = ref({
  country: 'USA'
})

const alert = ref({
  reg_in_submission: false,
  reg_show_alert: false,
  reg_alert_variant: 'bg-blue-500',
  reg_alert_msg: 'Please wait! Your account is being created.'
})

const userStore = useUserStore()

async function onRegister(values) {
  alert.value.reg_in_submission = true
  alert.value.reg_show_alert = true
  alert.value.reg_alert_variant = 'bg-blue-500'
  alert.value.reg_alert_msg = 'Please wait! Your account is being created.'

  try {
    await userStore.register(values)
  } catch (error) {
    console.error({ error })
    alert.value.reg_in_submission = false
    alert.value.reg_alert_variant = 'bg-red-500'
    alert.value.reg_alert_msg = 'An unexpected error occured. Please try again later'
    return
  }

  userStore.login()
  alert.value.reg_alert_variant = 'bg-green-500'
  alert.value.reg_alert_msg = 'Success! your account has been created.'
}
</script>
