<template>
  <app-header v-if="$route.name && $route.name !== '404'" />

  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <div :key="$route.name">
        <component :is="Component"></component>
      </div>
    </Transition>
  </router-view>

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
<style>
.fade-enter-from {
  opacity: 0;
  transform: translateX(100dvw);
}

.fade-enter-active {
  transition: all 0.15s linear;
}

.fade-leave-to {
  transition: all 0.15s linear;
  transform: translateX(-100dvw);
  opacity: 0;
}
</style>
