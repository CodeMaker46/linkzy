import { useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import type { User } from "firebase/auth";
export function useAuth() {
  const user = useAppStore(s => s.user)
  const setUser = useAppStore(s => s.setUser)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(minUser(u))
        // Ensure a user profile document exists for pairing lookup by email
        setDoc(doc(db, 'users', u.uid), { email: u.email, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {})
      } else {
        setUser(null)
      }
    })
    return () => unsub()
  }, [setUser])

  return {
    user,
    signInEmail: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
    signUpEmail: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
    signInGoogle: () => signInWithPopup(auth, googleProvider),
    signOut: () => signOut(auth),
  }
}

function minUser(u: User) {
  return { uid: u.uid, email: u.email }
}

