<template>
  <!-- Header -->
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-between items-center py-5 px-4">
      <!-- App Name -->
      <router-link class="text-white font-bold uppercase text-2xl" to="/">Music</router-link>

      <div class="items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <template v-if="!isLoggedInStatus">
            <li>
              <span
                class="px-2 text-white hover:cursor-pointer hover:text-amber-500"
                @click="modalStore.setOpenStatus()"
                >Login / Register</span
              >
            </li>
            <li>
              <router-link class="px-2 text-white" to="/about">About</router-link>
            </li>
          </template>
          <template v-else>
            <li>
              <span class="px-2 text-white"
                >Wellcome{{ userData ? ` ${userData['first_name']} ${userData['last_name']}` : '' }}
              </span>
            </li>
            <li>
              <a class="px-2 text-white" href="#">Manage</a>
            </li>
            <li @click.prevent="userStore.logout()">
              <span class="px-2 text-white hover:cursor-pointer">Logout</span>
            </li>
          </template>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '../stores/user'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const modalStore = useModalStore()
const userStore = useUserStore()

const isLoggedInStatus = computed(() => userStore.isLoggedIn)
const userData = computed(() => userStore.userData)
</script>
