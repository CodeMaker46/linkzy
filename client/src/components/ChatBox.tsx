import { useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

const formatTime = (timestamp: any) => {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    return onSnapshot(q, snap => setMsgs(snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))))
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
    <div className="card p-4 flex-1 flex flex-col bg-black/20 overflow-hidden">
      {!pairId && (
        <div className="mb-3 text-sm opacity-80">Go to Profile to connect with a partner.</div>
      )}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        <AnimatePresence>
          {msgs.map(m => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex flex-col max-w-[75%] w-fit p-2 px-3 rounded-xl ${m.senderId === user?.uid ? 'ml-auto bg-pink-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
              <p className="text-sm">{m.text}</p>
              <span className="text-xs self-end opacity-70 mt-1">{formatTime(m.timestamp)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <div className="pt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Type a message…"
          className="flex-1 input h-10 bg-gray-700 border-transparent focus:ring-pink-500 rounded-full px-4"
        />
        <button onClick={send} className="rounded-full h-10 w-10 flex items-center justify-center text-white bg-pink-600 hover:bg-pink-500 flex-shrink-0">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}