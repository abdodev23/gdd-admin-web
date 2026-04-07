import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Same Firebase project as the user web app. Role-based access is enforced
// by the backend, not by Firebase. Don't create a separate Firebase project
// or web app for admin.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = !!firebaseConfig.apiKey

let app = null
let auth = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} else {
  console.warn('Firebase not configured — auth disabled. Add VITE_FIREBASE_* vars to .env')
}

export { auth }
export default app
