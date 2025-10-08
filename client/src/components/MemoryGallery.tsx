import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

interface Memory {
  id: string;
  url: string;
  uploader: string;
  timestamp: any;
  description: string;
}

export default function MemoryGallery() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [items, setItems] = useState<Memory[]>([])
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const memRef = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'memories') : (null as any), [pairId])

  useEffect(() => {
    if (!pairId || !memRef) return
    const q = query(memRef, orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => {
      const newItems = snap.docs.map(d => {
        if (!d.exists()) return null
        return { id: d.id, ...d.data() } as Memory
      })
      setItems(newItems.filter((item): item is Memory => item !== null))
    })
  }, [pairId, memRef])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !pairId) return
    const file = e.target.files?.[0]
    if (!file) return
    const r = ref(storage, `pairs/${pairId}/memories/${Date.now()}_${file.name}`)
    await uploadBytes(r, file)
    const url = await getDownloadURL(r)
    await addDoc(memRef, { url, uploader: user.uid, timestamp: serverTimestamp(), description: '' })
  }

  return (
    <div className="space-y-3">
      {!pairId && (
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
          Go to Profile to connect with a partner and share memories.
        </div>
      )}
      <div>
        <input type="file" accept="image/*,video/*" onChange={onUpload} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence>
          {items.map(it => (
            <motion.a
              key={it.id}
              href={it.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="block overflow-hidden rounded-2xl bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="memory" className="w-full h-40 object-cover" />
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

