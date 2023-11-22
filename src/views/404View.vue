<template>
  <div class="flex items-center justify-center h-80 pt-12">
    <div class="flex flex-col text-center bg-white py-8 w-96 rounded shadow">
      <h1 class="text-5xl font-bold">404</h1>
      <span class="mt-4">Page {{ $route.fullPath }} is not found</span>

      <router-link class="mt-5 text-blue-500" :to="{ name: 'home' }">Go To Home</router-link>
    </div>
  </div>
</template>

<script setup></script>
