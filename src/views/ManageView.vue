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
          <div class="p-6">
            <!-- Composition Items -->
            <composition-songs v-for="song in songs" :key="song.docID" :song="song" />
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
const songs = ref([])

onMounted(() => getSongs())

async function getSongs() {
  songs.value = []
  const que = query(songsCollection(), where('uid', '==', auth.currentUser.uid))
  const snapshot = await getDocs(que)

  snapshot.forEach((doc) => (songs.value = songs.value.concat({ docID: doc.id, ...doc.data() })))
}

watch(
  () => userStore.isLoggedIn,
  (newVal) => {
    if (!newVal) router.push({ name: 'home' })
  }
)
</script>
