import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ToDoList from './ToDoList.tsx'
import MoodTracker from './MoodTracker.tsx'
import Calendar from './Calendar.tsx'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/firebase.ts'
import { useAppStore } from '../store/useAppStore.ts'
import StatCard from './StatCard.tsx'
import { CheckCircle2, Heart, CalendarDays, MessageCircle, Music, Code, Wallet, Image as ImageIcon, LayoutGrid } from 'lucide-react'
import HeroBanner from './HeroBanner.tsx'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function Dashboard() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null

  const tasksRef = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'tasks') : (null as any), [pairId])
  const [taskCount, setTaskCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (!pairId || !tasksRef) return
    const q = query(tasksRef, orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => d.data() as any)
      setTaskCount(all.length)
      setCompletedCount(all.filter(t => t.completed).length)
    })
  }, [pairId, tasksRef])

  return (
    <div className="space-y-4">
      <HeroBanner
        title="Welcome back to Linkzy"
        subtitle="Track your day, sync with your partner, and jump into what matters."
        icon={<Heart />}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CheckCircle2 size={18} />} title="Tasks" value={taskCount} subtitle="Total today" delay={0.02}>
          <div className="text-sm opacity-80">Completed {completedCount} • Pending {Math.max(taskCount - completedCount, 0)}</div>
        </StatCard>
        <StatCard icon={<Heart size={18} />} title="Couple Mood" subtitle="Tap to set yours" delay={0.04}>
          <MoodTracker />
        </StatCard>
        <StatCard icon={<CalendarDays size={18} />} title="Calendar" subtitle="Upcoming events" delay={0.06}>
          <div className="text-sm opacity-80">Check shared schedule</div>
        </StatCard>
        <StatCard icon={<LayoutGrid size={18} />} title="Quick Links" subtitle="Jump back in" delay={0.08}>
          <div className="flex flex-wrap gap-2 pt-1">
            <Quick to="/chat" icon={<MessageCircle size={14} />} label="Chat" />
            <Quick to="/music" icon={<Music size={14} />} label="Music" />
            <Quick to="/coding" icon={<Code size={14} />} label="Coding" />
            <Quick to="/expenses" icon={<Wallet size={14} />} label="Expenses" />
            <Quick to="/memories" icon={<ImageIcon size={14} />} label="Memories" />
          </div>
        </StatCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <motion.div layout className="card card-hover p-4 xl:col-span-2">
          <h3 className="font-semibold mb-2">Calendar</h3>
          <Calendar />
        </motion.div>
        <motion.div layout className="card card-hover p-4">
          <h3 className="font-semibold mb-2">Shared To-Do</h3>
          <ToDoList />
        </motion.div>
      </div>
    </div>
  )
}

function Quick({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={to} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5">
      {icon}
      <span>{label}</span>
    </a>
  )
}

