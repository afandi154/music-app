<template>
  <!-- Main Content -->
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <manage-upload @upload="getSongs" />
      </div>
      <div class="col-span-2">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">My Songs</span>
            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
          </div>
          <div class="p-6" v-if="songs.length">
            <!-- Composition Items -->
            <composition-songs
              v-for="song in songs"
              :key="song.docID"
              :song="song"
              @update="(modified_value) => updateSong(modified_value)"
              @remove="(song_id) => deleteSong(song_id)"
            />
          </div>
          <div class="p-6 text-center" v-else-if="!songs.length && isSearch">
            <h3 class="text-xl font-bold">There's No Songs...</h3>
          </div>
          <div v-else class="p-6 flex justify-center">
            <img class="w-10 h-10" src="@/assets/spinner.svg" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, songsCollection } from '@/includes/firebase'
import { getDocs, query, where } from 'firebase/firestore'
import ManageUpload from '@/components/ManageUpload.vue'
import CompositionSongs from '@/components/CompositionSongs.vue'

const userStore = useUserStore()
const router = useRouter()

const isSearch = ref(false)
const songs = ref([])

onMounted(() => getSongs())

async function getSongs() {
  songs.value = []
  isSearch.value = false
  const que = query(songsCollection(), where('uid', '==', auth.currentUser.uid))

  await getDocs(que).then((snapshot) => {
    isSearch.value = true
    snapshot.forEach((doc) => (songs.value = songs.value.concat({ docID: doc.id, ...doc.data() })))
  })
}

function updateSong(value) {
  console.log({ value })
  const songIndex = songs.value.findIndex((song) => song.docID === value.id)

  songs.value[songIndex] = {
    ...songs.value[songIndex],
    modified_name: value.song_title,
    artist: value.song_artist,
    genre: value.song_genre
  }
}

function deleteSong(id) {
  songs.value = songs.value.filter((song) => song.docID !== id)
  console.log({ id, songs })
}

watch(
  () => userStore.isLoggedIn,
  (newVal) => {
    if (!newVal) router.push({ name: 'home' })
  }
)
</script>
