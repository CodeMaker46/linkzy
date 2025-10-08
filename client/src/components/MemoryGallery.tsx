import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

interface MemoryData {
  url: string
  uploader: string
  timestamp: any
  description: string
}

interface Memory extends MemoryData {
  id: string
}

export default function MemoryGallery() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [items, setItems] = useState<Memory[]>([])

  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null

  const memRef = useMemo(
    () => (pairId ? collection(db, 'pairs', pairId, 'memories') : null),
    [pairId]
  )

  useEffect(() => {
    if (!pairId || !memRef) return

    const q = query(memRef, orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => {
      const newItems = snap.docs
        .map((d: QueryDocumentSnapshot<DocumentData>) => {
          const data = d.data()
          if (!data || typeof data !== 'object') return null
          const memoryData = data as MemoryData
          return { id: d.id, ...memoryData } as Memory
        })
        .filter((item): item is Memory => item !== null)

      setItems(newItems)
    })
  }, [pairId, memRef])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !pairId || !memRef) return

    const file = e.target.files?.[0]
    if (!file) return

    const r = ref(storage, `pairs/${pairId}/memories/${Date.now()}_${file.name}`)
    await uploadBytes(r, file)
    const url = await getDownloadURL(r)

    await addDoc(memRef, {
      url,
      uploader: user.uid,
      timestamp: serverTimestamp(),
      description: '',
    })
  }

  return (
    <div className="p-4">
      {!pairId && (
        <p className="text-gray-500 text-center">
          Go to Profile to connect with a partner and share memories.
        </p>
      )}

      <input type="file" onChange={onUpload} className="my-4" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {items.map((it: Memory) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl overflow-hidden shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="memory" className="w-full h-48 object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
