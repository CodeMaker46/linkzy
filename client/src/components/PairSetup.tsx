import { useState } from 'react'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function PairSetup() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const setPartnerUid = useAppStore(s => s.setPartnerUid)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function link() {
    if (!user || !email.trim()) return
    setStatus(null)
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email.trim()))
    const snap = await getDocs(q)
    if (snap.empty) {
      setStatus('No user found with that email')
      return
    }
    const partner = snap.docs[0]
    const partnerId = partner.id
    const pairId = computePairId(user.uid, partnerId)
    await setDoc(doc(db, 'pairs', pairId), { uidA: user.uid, uidB: partnerId, updatedAt: serverTimestamp() }, { merge: true })
    setPartnerUid(partnerId)
    setStatus('Linked! You can chat now.')
  }

  if (!user) return null
  return (
    <div className="card p-4 space-y-3">
      <div className="font-semibold">Pair with your partner</div>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Partner email"
          className="flex-1 rounded-xl bg-transparent border border-white/10 px-3 py-2"
        />
        <button className="rounded-xl px-4 bg-purple-600 hover:bg-purple-500" onClick={link}>Link</button>
      </div>
      {partnerUid && <div className="text-sm opacity-80">Linked to: {partnerUid}</div>}
      {status && <div className="text-sm opacity-80">{status}</div>}
    </div>
  )
}

