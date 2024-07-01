<script setup>
import { usePlayerStore } from '@/stores/player'
import { computed, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { auth, songsDoc, songsCollection } from '@/includes/firebase'
import { getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'

const playerStore = usePlayerStore()
const currentSong = computed(() => playerStore.currentSong)
const songTimer = computed(() => playerStore.timer)

const route = useRoute()
const song = ref({})

watch(
  () => route.params.id,
  (songId) => {
    if (songId) getSong(songId)
  }
)

function toggleSong() {
  if (!playerStore.sound.playing) {
    if (route.params.id) {
      playerStore.newSong(song.value)
    } else {
      // Pick 1 song from the top of home song list
      getFirstSong()
    }
  } else {
    playerStore.toggleAudio()
  }
}

async function getSong(songId) {
  const que = songsDoc(songId)
  const docSnap = await getDoc(que)

  if (docSnap.exists()) {
    song.value = docSnap.data()
  }
}

async function getFirstSong() {
  const que = query(
    songsCollection(),
    where('uid', '==', auth.currentUser.uid),
    orderBy('modified_name'),
    limit(1)
  )
  const snapshot = await getDocs(que)

  playerStore.newSong(snapshot.docs[0].data())
}
</script>

<template>
  <div v-if="$route.name !== '404'" class="fixed bottom-0 left-0 bg-white px-4 py-2 w-full">
    <!-- Track Info -->
    <div class="text-center" v-if="Object.keys(currentSong).length">
      <span class="song-title font-bold">{{ currentSong.modified_name }}</span> by
      <span class="song-artist">{{ currentSong.artist }}</span>
    </div>
    <div class="flex flex-nowrap gap-4 items-center">
      <!-- Play/Pause Button -->
      <button type="button" @click.prevent="toggleSong">
        <i
          class="fa text-gray-500 text-xl"
          :class="{
            'fa-play': !playerStore.isPlaying,
            'fa-pause': playerStore.isPlaying
          }"
        ></i>
      </button>
      <!-- Current Position -->
      <div class="player-currenttime" style="width: 50px">{{ songTimer.seek }}</div>
      <!-- Scrub Container  -->
      <div
        @click.prevent="playerStore.updateSeek($event)"
        class="w-full h-2 rounded bg-gray-200 relative cursor-pointer"
      >
        <!-- Player Ball -->
        <span
          class="absolute -top-2.5 -ml-2.5 text-gray-800 text-lg"
          :style="{ left: songTimer.progressBar }"
        >
          <i class="fas fa-circle"></i>
        </span>
        <!-- Player Progress Bar-->
        <span
          class="block h-2 rounded bg-gradient-to-r from-green-500 to-green-400"
          :style="{ width: songTimer.progressBar }"
        ></span>
      </div>
      <!-- Duration -->
      <div class="player-duration">{{ songTimer.duration }}</div>
    </div>
  </div>
</template>
