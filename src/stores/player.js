import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Howl } from 'howler'
import helper from '@/helpers/global'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref({})
  const sound = ref({})
  const timer = ref({
    seek: '00:00',
    duration: '00:00',
    progressBar: '0%'
  })

  const isPlaying = computed(() => {
    if (sound.value.playing) {
      return sound.value.playing()
    }

    return false
  })

  async function newSong(song) {
    currentSong.value = song

    if (sound.value instanceof Howl) {
      sound.value.unload()
    }

    sound.value = new Howl({
      src: [song.download_url],
      html5: true,
      onend: () => {
        currentSong.value = {}
        sound.value = {}
      }
    })

    sound.value.play()
    sound.value.on('play', () => {
      requestAnimationFrame(progress)
    })
  }

  async function toggleAudio() {
    if (!sound.value.playing) {
      return
    }

    if (sound.value.playing()) {
      sound.value.pause()
    } else {
      sound.value.play()
    }
  }

  function progress() {
    if (!sound.value.playing) {
      return
    }
    timer.value.seek = helper.formatTime(sound.value.seek())
    timer.value.duration = helper.formatTime(sound.value.duration())

    timer.value.progressBar = `${(sound.value.seek() / sound.value.duration()) * 100}%`

    if (sound.value.playing()) {
      requestAnimationFrame(progress)
    }
  }

  function updateSeek(event) {
    if (!sound.value.playing) {
      return
    }

    const { x, width } = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - x
    const percent = clickX / width
    const seconds = sound.value.duration() * percent

    sound.value.seek(seconds)
    sound.value.once('seek', progress)
  }

  return { currentSong, sound, timer, isPlaying, newSong, toggleAudio, updateSeek }
})
