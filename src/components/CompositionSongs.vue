<script setup>
import { computed, ref } from 'vue'
import { deleteDoc, updateDoc } from 'firebase/firestore'
import { songsDoc, storage } from '@/includes/firebase'
import { deleteObject, ref as refs } from 'firebase/storage'

const emit = defineEmits(['update', 'remove'])
const props = defineProps({
  song: Object
})

const songForm = computed(() => ({
  song_title: props.song.modified_name,
  song_artist: props.song.artist,
  song_genre: props.song.genre
}))

const validationSchema = ref({
  song_title: 'required|min:3|max:50',
  song_artist: 'required|min:3|max:25',
  song_genre: 'required|min:3|max:25'
})

const isEditModal = ref(false)
const isEditSubmit = ref(false)
const isEditSuccess = ref(false)

const isDeleteModal = ref(false)
const isDeleteSubmit = ref(false)
const isDeleteSuccess = ref(false)

const warning = ref({
  show: false,
  message: ''
})

function onEdit() {
  isEditModal.value = !isEditModal.value
}

function onDelete() {
  isDeleteModal.value = true
}

async function onSubmit(values) {
  isEditSubmit.value = true
  const songID = props.song.docID

  try {
    await updateDoc(songsDoc(songID), {
      modified_name: values['song_title'],
      artist: values['song_artist'],
      genre: values['song_genre']
    }).then(() => emit('update', { id: songID, ...values }))
  } catch (err) {
    isEditSubmit.value = false
    warning.value.show = true
    warning.value.message = err
    return
  }

  isEditSubmit.value = false
  isEditSuccess.value = true
}

async function confirmDelete() {
  const songName = `${props.song.sid}_${props.song.original_name}`
  const songRef = refs(storage, `songs/${props.song.uid}/${songName}`)
  const songID = props.song.docID

  isDeleteSubmit.value = true
  deleteObject(songRef)
    .then(async () => {
      // File deleted successfully
      try {
        await deleteDoc(songsDoc(songID)).then(() => {
          isDeleteSubmit.value = false
          isDeleteSuccess.value = true
          emit('remove', songID)
        })
      } catch (err) {
        console.log({ err })
        return
      }
    })
    .catch((error) => {
      // Uh-oh, an error occurred!
      console.log({ error })
    })
}

function setClear() {
  isEditModal.value = false
  isEditSubmit.value = false
  isEditSuccess.value = false

  warning.value.show = false
  warning.value.message = ''
}
</script>
<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div class="flex justify-between">
      <div>
        <h4 class="text-2xl font-bold" style="line-height: 1.25rem">{{ song.modified_name }}</h4>
        <span class="text-md font-bold">{{ song.artist ? song.artist : 'Unknown' }}</span>
      </div>
      <div class="flex gap-2 flex-nowrap items-center">
        <button
          title="Edit"
          class="py-1 px-2 text-sm rounded text-white bg-blue-600"
          @click.prevent="onEdit"
        >
          <i class="fa fa-pencil-alt"></i>
        </button>
        <button
          title="Delete"
          class="py-1 px-2 text-sm rounded text-white bg-red-600"
          @click.prevent="onDelete"
        >
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
    <div v-if="isEditModal" class="mt-4">
      <div v-if="warning.show" class="text-white text-center font-bold p-4 rounded mb-4 bg-red-500">
        <span>{{ warning.message }}</span>
      </div>
      <vee-form :validation-schema="validationSchema" @submit="onSubmit" :initial-values="songForm">
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            type="text"
            name="song_title"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
          />
          <error-message class="text-red-600" name="song_title" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Artist</label>
          <vee-field
            type="text"
            name="song_artist"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter The Artist"
          />
          <error-message class="text-red-600" name="song_artist" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            type="text"
            name="song_genre"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter The Genre"
          />
          <error-message class="text-red-600" name="song_genre" />
        </div>
        <button
          type="submit"
          :disabled="isEditSubmit"
          class="py-1.5 px-3 mr-3 rounded text-white bg-green-600"
        >
          <i v-show="isEditSubmit" class="fas fa-spinner fa-spin"></i>
          <i v-show="isEditSuccess" class="fas fa-check"></i>
          Submit
        </button>
        <button
          type="button"
          :disabled="isEditSubmit"
          class="py-1.5 px-3 rounded text-white bg-gray-600"
          @click="setClear"
        >
          Close
        </button>
      </vee-form>
    </div>
  </div>
  <Teleport v-if="isDeleteModal" to="#app-modal">
    <div class="overlay flex flex-col align-center justify-center">
      <div class="container mx-auto p-4 rounded">
        <p class="font-bold mb-5">Are you sure to delete "{{ props?.song?.modified_name }}" ?</p>

        <div class="flex justify-end gap-4">
          <button
            class="py-1 px-3 rounded text-white bg-red-600"
            type="button"
            :disabled="isDeleteSubmit || isDeleteSuccess"
            @click="confirmDelete"
          >
            <i v-if="isDeleteSubmit" class="fas fa-spinner fa-spin"></i>
            <span v-else>Yes</span>
          </button>
          <button
            class="py-1 px-3 rounded text-white bg-gray-600"
            type="button"
            :disabled="isDeleteSubmit"
            @click="isDeleteModal = false"
          >
            No
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.container {
  background: #fff;
  max-width: 600px;
}
</style>
