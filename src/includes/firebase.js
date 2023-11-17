import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBIsodigiw4PfutY6AXal7_QczbCIlmA2k',
  authDomain: 'music-app-a9380.firebaseapp.com',
  projectId: 'music-app-a9380',
  storageBucket: 'music-app-a9380.appspot.com',
  appId: '1:234201440367:web:c53748649db77cdac3ed9a'
  // messagingSenderId: "234201440367",
}

// export default firebase.initializeApp(firebaseConfig)
const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore(app)

const usersCollection = (uid) => doc(db, 'users', uid)

export { auth, db, usersCollection }
