import { useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function ChatBox() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState<any[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const msgsRef = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'messages') : null, [pairId])

  useEffect(() => {
    if (!msgsRef) return
    const q = query(msgsRef, orderBy('timestamp', 'asc'))
    return onSnapshot(q, snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [msgsRef])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send() {
    if (!text.trim() || !user || !msgsRef) return
    await addDoc(msgsRef, {
      text: text.trim(),
      senderId: user.uid,
      timestamp: serverTimestamp(),
    })
    setText('')
  }

  return (
    <div className="card p-4 h-[60vh] flex flex-col">
      {!pairId && (
        <div className="mb-3 text-sm opacity-80">Link a partner to start chatting.</div>
      )}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {msgs.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`max-w-[70%] rounded-2xl px-3 py-2 ${m.senderId === user?.uid ? 'ml-auto bg-pink-600/20' : 'bg-white/10'}`}
            >
              <div className="text-sm">{m.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <div className="pt-3 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Type a message…"
          className="flex-1 input"
        />
        <button onClick={send} className="rounded-xl px-4 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 btn-shimmer">Send</button>
      </div>
    </div>
  )
}

