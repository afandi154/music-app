<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { auth, songsCollection } from '@/includes/firebase'
import { getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'

const quote = ref({
  author: '',
  content: '',
  isDone: false,
  isPending: false
})
const song = ref({
  songs: [],
  isDone: false,
  isPending: false,
  message: !auth.currentUser ? 'Login to see your songs!' : "There's No Songs..."
})

const lastVisible = ref(null)

onMounted(() => {
  getQuotes()
  getSongs()

  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

async function getQuotes() {
  quote.value.isPending = true
  const response = await fetch('https://api.quotable.io/random')

  await response.json().then((res) => {
    quote.value.isDone = true
    quote.value.isPending = true

    quote.value.author = res.author
    quote.value.content = res.content
  })
}

async function getSongs() {
  if (!auth.currentUser) {
    song.value.isDone = true
    return
  } else if (song.value.isPending) return

  let nextQuery
  song.value.isPending = true

  if (song.value.songs.length) {
    const que = query(songsCollection(), where('uid', '==', auth.currentUser.uid))
    const snapshot = await getDocs(que)

    if (song.value.songs.length === snapshot.docs.length) {
      song.value.isDone = true
      song.value.isPending = false
      return
    }

    nextQuery = query(
      songsCollection(),
      where('uid', '==', auth.currentUser.uid),
      orderBy('modified_name'),
      startAfter(lastVisible.value),
      limit(5)
    )
  } else {
    nextQuery = query(
      songsCollection(),
      where('uid', '==', auth.currentUser.uid),
      orderBy('modified_name'),
      limit(5)
    )
  }

  await getDocs(nextQuery)
    .then((snapshot) => {
      song.value.isDone = true
      song.value.isPending = false
      song.value.onScroll = false

      snapshot.forEach(
        (doc) => (song.value.songs = song.value.songs.concat({ docID: doc.id, ...doc.data() }))
      )

      lastVisible.value = snapshot.docs[snapshot.docs.length - 1]
    })
    .catch((err) => {
      song.value.isDone = true
      song.value.isPending = false
      console.error({ err })
    })
}

const onScroll = ref(false)
const scrollCount = ref(0)

function handleScroll() {
  const { scrollTop, offsetHeight } = document.documentElement
  const { innerHeight } = window
  const isBottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight

  if (isBottomOfWindow) {
    // Handle paginate
    scrollCount.value += 1

    if (scrollCount.value > 1) {
      onScroll.value = true
      getSongs()
    }
  }
}
</script>

<template>
  <!-- Introduction -->
  <section class="mb-8 py-20 text-white text-center relative">
    <div
      class="absolute inset-0 w-full h-full bg-contain introduction-bg"
      style="background-image: url(assets/img/header.png)"
    ></div>
    <div class="container mx-auto">
      <div class="text-white main-header-content">
        <h1 class="font-bold text-5xl mb-5">Listen to Great Music!</h1>
        <p v-if="quote.author" class="w-full md:w-8/12 mx-auto">
          <q
            ><em>{{ quote.content }}</em></q
          >
          - {{ quote.author }}
        </p>
        <p class="w-full md:w-8/12 mx-auto" v-else-if="!quote.author && quote.isSearch">
          New Day new Song!
        </p>
        <div v-else class="p-6 flex justify-center">
          <img class="w-10 h-10" src="@/assets/loadingBar.svg" />
        </div>
      </div>
    </div>

    <img
      class="relative block mx-auto mt-5 -mb-20 w-auto max-w-full"
      src="/assets/img/introduction-music.png"
    />
  </section>

  <!-- Main Content -->
  <section class="container mx-auto">
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
        <span class="card-title">Songs</span>
        <!-- Icon -->
        <i class="fa fa-headphones-alt float-right text-green-400 text-xl"></i>
      </div>
      <!-- Playlist -->
      <ol v-if="song.songs.length" id="playlist">
        <li
          v-for="song in song.songs"
          :key="song.docID"
          class="py-3 px-6 cursor-pointer transition duration-300 hover:bg-gray-50"
        >
          <router-link
            class="flex justify-between items-center"
            :to="{ name: 'song', params: { id: song.docID } }"
          >
            <div>
              <a href="#" class="font-bold block text-gray-600">{{ song.modified_name }}</a>
              <span class="text-gray-500 text-sm">{{ song.artist }}</span>
            </div>

            <div class="text-gray-600 text-lg">
              <span class="comments">
                <i class="fa fa-comments text-gray-600"></i>
                {{ song.comment_count }}
              </span>
            </div>
          </router-link>
        </li>
      </ol>
      <div class="p-6 text-center" v-else-if="!song.songs.length && song.isDone">
        <h3 class="text-xl font-bold">{{ song.message }}</h3>
      </div>
      <div v-else-if="song.isPending" class="p-6 flex justify-center">
        <img class="w-10 h-10" src="@/assets/spinner.svg" />
      </div>
      <!-- .. end Playlist -->
    </div>
    <div v-if="onScroll && song.isPending" class="p-3 flex justify-center">
      <img class="w-10 h-10" src="@/assets/spinner.svg" />
    </div>
  </section>
</template>
