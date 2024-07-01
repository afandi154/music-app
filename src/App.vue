<template>
  <app-header v-if="$route.name && $route.name !== '404'" />

  <router-view></router-view>

  <!-- Player -->
  <player />

  <app-auth />
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppAuth from '@/components/AppAuth.vue'
import Player from '@/components/Player.vue'
import { useUserStore } from '@/stores/user'
import { onBeforeMount } from 'vue'
import { auth } from './includes/firebase'
import { RouterView } from 'vue-router'

const userStore = useUserStore()

onBeforeMount(async () => {
  if (auth.currentUser) {
    userStore.login()

    try {
      await userStore.getUserData(auth.currentUser.uid)
    } catch (error) {
      userStore.logout()
      console.error({ error })
      return
    }
  }
})
</script>
