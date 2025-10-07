import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase/firebase'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAppStore } from '../store/useAppStore'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function CodeEditor() {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, Linkzy!\")\n}')
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const docRef = useMemo(() => pairId ? doc(db, 'pairs', pairId, 'docs', 'editor') : (null as any), [pairId])
  const extensions = [javascript({ jsx: true })]

  useEffect(() => {
    if (!pairId || !docRef) return
    return onSnapshot(docRef, (snap) => {
      const data = snap.data() as any
      if (data?.content !== undefined) setCode(data.content)
    })
  }, [pairId, docRef])

  async function handleChange(next: string) {
    setCode(next)
    if (!pairId || !docRef) return
    await setDoc(docRef, { content: next, updatedAt: serverTimestamp() }, { merge: true })
  }

  return (
    <div className="gradient-border">
      <div className="card p-4">
      {!pairId && (
        <div className="mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          Link a partner in Chat to collaborate in the editor.
        </div>
      )}
      <CodeMirror
        value={code}
        height="300px"
        theme={oneDark}
        extensions={extensions}
        onChange={handleChange}
      />
      </div>
    </div>
  )
}

