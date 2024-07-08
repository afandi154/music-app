<script setup>
import { songsDoc } from '@/includes/firebase'
import { addDoc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { commentCollection } from '@/includes/firebase'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const userData = computed(() => userStore.userData)

const song = ref({})
const comment = ref({
  data: [],
  modifiedData: [],
  orderBy: '1',
  isPending: false,
  isDone: false
})

const validationSchema = ref({
  comment: 'required|min:3'
})

async function getSong(songId) {
  const que = songsDoc(songId)
  const docSnap = await getDoc(que)

  if (docSnap.exists()) {
    song.value = docSnap.data()
  } else {
    // docSnap.data() will be undefined in this case
    router.push({ name: 'home' })
  }
}

async function getComment(songId) {
  const que = query(commentCollection(), where('sid', '==', songId))

  comment.value.isPending = true
  await getDocs(que)
    .then((snapshot) => {
      comment.value.isDone = true
      comment.value.isPending = false

      snapshot.forEach((doc) => (comment.value.data = comment.value.data.concat(doc.data())))
      comment.value.data = comment.value.data
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reverse()

      comment.value.modifiedData = comment.value.data
    })
    .catch((err) => {
      comment.value.isDone = true
      comment.value.isPending = false
      console.error({ err })
    })
}

const isCommentSubmit = ref(false)
const isCommentSuccess = ref(false)
const warningMessage = ref('')

async function submitComment(values, { resetForm }) {
  isCommentSubmit.value = true
  isCommentSuccess.value = false

  const comm = {
    sid: route.params.id,
    comment: values['comment'],
    username: userData.value
      ? `${userData.value['first_name']} ${userData.value['last_name']}`
      : 'Anonymous',
    date: new Date().toString()
  }
  await addDoc(commentCollection(), comm)
    .then(() => {
      song.value['comment_count'] = song.value['comment_count'] += 1
      comment.value.data = [comm, ...comment.value.data]

      if (comment.value.orderBy === '2') {
        comment.value.modifiedData = comment.value.data.reverse()
      } else {
        comment.value.modifiedData = comment.value.data
      }

      updateSong(route.params.id)
      resetForm()
    })
    .catch((err) => {
      isCommentSubmit.value = false
      isCommentSuccess.value = false
      warningMessage.value = err
      return
    })
}

async function updateSong(songID) {
  try {
    await updateDoc(songsDoc(songID), {
      comment_count: song.value['comment_count']
    }).then(() => {
      warningMessage.value = ''
      isCommentSubmit.value = false
      isCommentSuccess.value = true
    })
  } catch (err) {
    isCommentSubmit.value = false
    isCommentSuccess.value = false
    warningMessage.value = err
    return
  }
}

function toggleSong(sound) {
  if (!playerStore.sound.playing) {
    playerStore.newSong(sound)
  } else {
    if (playerStore.currentSong.sid !== song.value.sid) {
      playerStore.newSong(sound)
    } else playerStore.toggleAudio()
  }
}

function orderComment(e) {
  if (e.target.value === '2') {
    comment.value.modifiedData = [...comment.value.data].reverse()
  } else {
    comment.value.modifiedData = comment.value.data
  }
}

function getRelativeTime(date, locale = undefined) {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const DIVISIONS = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' }
  ]

  let duration = (date - new Date()) / 1000
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
}

onMounted(() => {
  getSong(route.params.id)
  getComment(route.params.id)
})
</script>
<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
          @click.prevent="toggleSong(song)"
        >
          <i
            class="fas"
            :class="{
              'fa-play': playerStore.currentSong.sid !== song.sid || !playerStore.isPlaying,
              'fa-pause': playerStore.currentSong.sid === song.sid && playerStore.isPlaying
            }"
          ></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <h3 class="text-3xl font-bold" v-if="song.modified_name">{{ song.modified_name }}</h3>
          <div v-else class="h-5 w-40 bg-slate-100 animate-pulse rounded mb-3"></div>

          <span v-if="song.artist">{{ song.artist }}</span>
          <div v-else class="h-4 w-32 bg-slate-100 animate-pulse rounded"></div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto my-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">Comments ({{ comment.data.length }})</span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            v-if="!isCommentSubmit && warningMessage"
            class="text-white text-center font-bold p-4 rounded mb-4 bg-red-500"
          >
            <span>{{ warningMessage }}</span>
          </div>
          <vee-form :validation-schema="validationSchema" @submit="submitComment" ref="form">
            <vee-field
              as="textarea"
              name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
              placeholder="Your comment here..."
            ></vee-field>
            <error-message class="text-red-600" name="comment" />

            <button
              type="submit"
              :disabled="isCommentSubmit"
              class="mt-4 py-1.5 px-3 rounded text-white bg-green-600 block"
            >
              <i v-show="isCommentSubmit" class="fas fa-spinner fa-spin"></i>
              <i v-show="isCommentSuccess" class="fas fa-check"></i>
              Submit
            </button>
          </vee-form>
        </div>
      </div>
    </section>
    <div class="container mx-auto mb-2 flex justify-end">
      <!-- Sort Comments -->
      <select
        class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        @change="orderComment"
        v-model="comment.orderBy"
      >
        <option value="1">Latest</option>
        <option value="2">Oldest</option>
      </select>
    </div>

    <!-- Comments -->
    <ul v-if="comment.data.length" class="container mx-auto">
      <li
        v-for="(comment, idx) in comment.modifiedData"
        :key="idx"
        class="p-6 bg-gray-50 border border-gray-200"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.username }}</div>
          <time>{{ getRelativeTime(new Date(comment.date)) }}</time>
        </div>

        <p>
          {{ comment.comment }}
        </p>
      </li>
    </ul>
    <div class="p-6 text-center" v-else-if="!comment.data.length && comment.isDone">
      <h3 class="text-xl font-bold">There's No Comment...</h3>
    </div>
    <div v-else-if="comment.isPending" class="p-6 flex justify-center">
      <img class="w-10 h-10" src="@/assets/spinner.svg" />
    </div>
  </main>
</template>

<style lang="scss" scoped></style>
