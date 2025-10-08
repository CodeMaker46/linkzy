import { useEffect, useMemo, useState } from 'react'
import Button from './ui/button'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

type Task = {
  id: string
  text: string
  completed: boolean
  createdAt?: any
  assignee: 'me' | 'partner' | 'both'
  createdBy: string
}

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function ToDoList() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [assignee, setAssignee] = useState<'me' | 'partner' | 'both'>('me')


	const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null

	const tasksRef = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'tasks') : (null as any), [pairId])

	useEffect(() => {
		if (!pairId || !tasksRef) return

		const q = query(tasksRef, orderBy('createdAt', 'desc'))
		const unsubscribe = onSnapshot(
			q,
			snap => {
				const next = snap.docs.map((d) => {
					const data = d.data({ serverTimestamps: 'estimate' }) as any
					const t: Task = {
						id: d.id,
						text: String(data?.text ?? ''),
						completed: Boolean(data?.completed),
						createdAt: data?.createdAt,
						assignee: (data?.assignee as 'me' | 'partner' | 'both') ?? 'me',
						createdBy: String(data?.createdBy ?? '')
					}
					return t
				})
				setTasks(next)
			},
			err => {
				console.error('Firestore snapshot error:', err)
			}
		)

		return () => unsubscribe()
	}, [pairId, tasksRef])

	const handleAddTask = async () => {
		if (!input.trim() || !user || !pairId || !tasksRef) return
    try {
      await addDoc(tasksRef, {
        text: input.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        assignee,
        createdBy: user.uid
      })
      setInput('')
    } catch (err) {
      console.error('Error adding task:', err)
    }
  }

	const handleToggleComplete = async (task: Task) => {
    try {
			if (!pairId) return
			await updateDoc(doc(db, 'pairs', pairId, 'tasks', task.id), {
        completed: !task.completed
      })
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

	const handleDeleteTask = async (taskId: string) => {
    try {
			if (!pairId) return
			await deleteDoc(doc(db, 'pairs', pairId, 'tasks', taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  return (
		<div className="space-y-3">
			{!pairId && (
				<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
					Go to Profile to connect with a partner and share tasks.
				</div>
			)}
      <div className="flex items-center gap-2">
        <input
          id="task-input"
          name="task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 input h-10"
        />
        <select
          id="assignee-select"
          name="assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as any)}
          className="input h-10"
        >
          <option value="me">Me</option>
          <option value="partner">Partner</option>
          <option value="both">Both</option>
        </select>
        <Button onClick={handleAddTask}>Add</Button>
      </div>
      <ul className="space-y-2">
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 ${t.completed ? 'opacity-70' : ''}`}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!t.completed}
                  onChange={() => handleToggleComplete(t)}
                />
                <span className={t.completed ? 'line-through' : ''}>{t.text}</span>
                <span className="badge ml-2">
                  {t.assignee}
                </span>
              </label>
              <button
                className="text-sm opacity-70 hover:opacity-100"
                onClick={() => handleDeleteTask(t.id)}
              >
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
