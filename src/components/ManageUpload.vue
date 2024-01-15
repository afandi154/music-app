<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 mb-5 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{ 'text-white bg-green-400 border-green-400 border-solid': isDragOver }"
        @dragover.prevent.stop="onDragOver($event)"
        @dragleave.prevent.stop="onDragLeave($event)"
        @drop.prevent.stop="onDrop($event)"
      >
        <h5>Drop your files here</h5>
      </div>

      <label class="block text-sm font-medium text-gray-900 my-2" for="multiple_files"
        >Or Choose Files</label
      >
      <input
        class="block w-full text-sm border border-blue-300 rounded-lg cursor-pointer bg-gray-50 p-1.5 mt-0 focus:outline-none"
        id="multiple_files"
        type="file"
        multiple
        @change="onDrop($event)"
      />

      <hr class="my-5" v-if="uploads.length" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="flex items-center gap-2 font-bold text-sm mb-1" :class="upload.class">
          <i :class="upload.icon"></i><span class="">{{ upload.name }}</span>
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar"
            :class="upload.variant"
            :style="{ width: `${upload.progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { storage, songsCollection } from '@/includes/firebase'
import { getDownloadURL, ref as refs, uploadBytesResumable } from 'firebase/storage'
import { auth } from '@/includes/firebase'
import { addDoc } from 'firebase/firestore'

const emit = defineEmits(['upload'])
const isDragOver = ref(false)
const uploads = ref([])

function onDragOver(event) {
  event.preventDefault()
  isDragOver.value = true

  event.dataTransfer.dropEffect = 'copy'
}

function onDragLeave(event) {
  console.log({ onDragLeave: event })

  isDragOver.value = false
}

function onDrop(event) {
  isDragOver.value = false

  const files = event.dataTransfer ? [...event.dataTransfer.files] : [...event.target.files]

  files.forEach((file) => {
    if (file.type !== 'audio/mpeg') {
      return
    } else {
      const storageRef = refs(storage) //music-app-a9380.appspot.com
      const songsRef = refs(storageRef, `songs/${file.name}`) //music-app-a9380.appspot.com/songs/filename.mp3

      const task = uploadBytesResumable(songsRef, file)

      const uploadIndex =
        uploads.value.push({
          task,
          progress: 0,
          name: file.name,
          variant: 'bg-blue-400',
          icon: 'fas fa-spinner fa-spin',
          class: ''
        }) - 1

      task.on(
        'state_changed',
        // On Progress
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          uploads.value[uploadIndex].progress = progress
        },
        // Error
        (error) => {
          console.warn(error)
          uploads.value[uploadIndex].icon = 'fas fa-xmark'
          uploads.value[uploadIndex].variant = 'bg-red-400'
          uploads.value[uploadIndex].class = 'text-red-400'
        },
        // Success
        async () => {
          const song = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            original_name: task.snapshot.ref.name,
            modified_name: task.snapshot.ref.name,
            genre: '',
            comment_count: 0
          }
          song.download_url = await getDownloadURL(task.snapshot.ref)
          await addDoc(songsCollection(), song)

          uploads.value[uploadIndex].icon = 'fas fa-check'
          uploads.value[uploadIndex].variant = 'bg-green-400'
          uploads.value[uploadIndex].class = 'text-green-400'

          emit('upload')
        }
      )
    }
  })
}

onBeforeUnmount(() => {
  uploads.value.forEach((upload) => {
    upload.task.cancel()
  })
})
</script>
<style scoped>
#multiple_files {
  margin-top: 0;
}
</style>
