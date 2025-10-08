import { useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'

const moods = ['😍','😊','😐','😴','😢']

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function MoodTracker() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const myDoc = useMemo(() => (pairId && user) ? doc(db, 'pairs', pairId, 'status', user.uid) : (null as any), [pairId, user])
  const partnerDoc = useMemo(() => (pairId && partnerUid) ? doc(db, 'pairs', pairId, 'status', partnerUid) : (null as any), [pairId, partnerUid])

  const [mine, setMine] = useState<string>('😊')
  const [partner, setPartner] = useState<string>('😊')

  useEffect(() => {
    if (!myDoc) return
    return onSnapshot(myDoc, (snap: any) => {
      const data = snap.data({ serverTimestamps: 'estimate' }) as any
      if (data?.mood) setMine(data.mood)
    })
  }, [myDoc])

  useEffect(() => {
    if (!partnerDoc) return
    return onSnapshot(partnerDoc, (snap: any) => {
      const data = snap.data({ serverTimestamps: 'estimate' }) as any
      if (data?.mood) setPartner(data.mood)
    })
  }, [partnerDoc])

  async function updateMyMood(next: string) {
    if (!myDoc) return
    setMine(next)
    await setDoc(myDoc, { mood: next, updatedAt: serverTimestamp() }, { merge: true })
  }

  return (
    <div className="space-y-3">
      <Row label="You" value={mine} onChange={updateMyMood} editable />
      <Row label="Partner" value={partner} onChange={() => {}} editable={false} />
      {!pairId && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">Go to Profile to connect with a partner and share moods.</div>
      )}
    </div>
  )
}

function Row({ label, value, onChange, editable = true }: { label: string; value: string; onChange: (m: string) => void; editable?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 opacity-70 text-sm">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {moods.map(m => (
          <button
            key={m}
            className={`h-9 w-9 rounded-xl transition ${value === m ? 'bg-white/10' : 'hover:bg-white/5'} ${!editable ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => editable && onChange(m)}
            disabled={!editable}
          >{m}</button>
        ))}
      </div>
    </div>
  )
}

