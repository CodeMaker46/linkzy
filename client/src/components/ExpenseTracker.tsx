import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function ExpenseTracker() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('General')
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const ref = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'expenses') : (null as any), [pairId])

  useEffect(() => {
    if (!pairId || !ref) return
    const q = query(ref, orderBy('timestamp', 'asc'))
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [pairId, ref])

  const chartData = items.map((it: any, idx: number) => ({ idx, amount: Number(it.amount) }))

  return (
    <div className="space-y-4">
      {!pairId && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          Link a partner in Chat to share expenses.
        </div>
      )}
      <div className="flex gap-2">
        <input className="rounded-xl bg-transparent border border-white/10 px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-xl bg-transparent border border-white/10 px-3 py-2" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select className="rounded-xl bg-transparent border border-white/10 px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>General</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Fun</option>
        </select>
        <button
          className="rounded-xl px-4 bg-purple-600 hover:bg-purple-500"
          onClick={async () => {
            if (!user || !pairId || !title.trim() || !amount.trim()) return
            await addDoc(ref, { title: title.trim(), amount: Number(amount), category, user: user.uid, timestamp: serverTimestamp() })
            setTitle(''); setAmount('')
          }}
        >Add</button>
      </div>
      <div className="card p-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <XAxis dataKey="idx" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

