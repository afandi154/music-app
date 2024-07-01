import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auth, usersCollection } from '@/includes/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { setDoc, getDoc } from 'firebase/firestore'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userData = ref(null)

  async function register(values) {
    const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password)
    const data = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      age: values.age,
      country: values.country
    }
    await setDoc(usersCollection(userCred.user.uid), data)
  }

  async function authenticate(values) {
    await signInWithEmailAndPassword(auth, values.email, values.password)

    login()
  }

  async function login() {
    isLoggedIn.value = true
  }

  async function logout() {
    await auth.signOut()

    isLoggedIn.value = false
    userData.value = null
    window.location.reload()
  }

  async function getUserData(uid) {
    const data = await getDoc(usersCollection(uid))

    userData.value = data.exists() ? data.data() : null
  }

  return { isLoggedIn, userData, register, login, logout, authenticate, getUserData }
})
