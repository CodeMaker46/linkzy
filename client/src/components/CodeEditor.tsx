import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { useEffect, useMemo, useState, useRef } from 'react'
import { db } from '../firebase/firebase'
import { doc, onSnapshot, serverTimestamp, setDoc, DocumentSnapshot } from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { useAppStore } from '../store/useAppStore'
import { Play } from 'lucide-react'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

export default function CodeEditor() {
  const [code, setCode] = useState(`function hello() {
  console.log("Hello, Linkzy!");
}`)
  const [language, setLanguage] = useState('javascript')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const isLocalUpdate = useRef(false)
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const docRef = useMemo(() => pairId ? doc(db, 'pairs', pairId, 'docs', 'editor') : null, [pairId])

  const extensions = useMemo(() => {
    const langExtensions = [oneDark];
    if (language === 'javascript') {
      langExtensions.push(javascript({ jsx: true }));
    } else if (language === 'python') {
      langExtensions.push(python());
    } else if (language === 'html') {
      langExtensions.push(html());
    } else if (language === 'css') {
      langExtensions.push(css());
    }
    return langExtensions;
  }, [language]);

  useEffect(() => {
    if (!pairId || !docRef) return
    return onSnapshot(docRef, (snap: DocumentSnapshot) => {
      if (isLocalUpdate.current) {
        isLocalUpdate.current = false
        return
      }
      const data = snap.data() as DocumentData | undefined
      if (data?.content !== undefined && typeof data.content === 'string') {
        setCode(data.content)
      }
    })
  }, [pairId, docRef])

  async function handleChange(next: string) {
    setCode(next)
    if (!pairId || !docRef) return
    
    isLocalUpdate.current = true
    
    const updateData = {
      content: next,
      updatedAt: serverTimestamp()
    }
    
    try {
      await setDoc(docRef, updateData, { merge: true })
    } catch (error) {
      console.error('Error updating editor:', error)
      isLocalUpdate.current = false
    }
  }

  const runCode = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    let consoleOutput = '';

    if (iframe.contentWindow) {
      const contentWindow = iframe.contentWindow as any;
      contentWindow.input = input;
      const iframeConsole = contentWindow.console;
      contentWindow.console.log = (...args: any[]) => {
        iframeConsole.log(...args)
        consoleOutput += args.map(a => JSON.stringify(a, null, 2)).join(' ') + '\n';
      };
      contentWindow.console.error = (...args: any[]) => {
        iframeConsole.error(...args)
        consoleOutput += 'ERROR: ' + args.map(a => JSON.stringify(a, null, 2)).join(' ') + '\n';
      };
    }

    try {
      const script = iframe.contentWindow?.document.createElement('script');
      if (script) {
        script.textContent = code;
        iframe.contentWindow?.document.body.appendChild(script);
      }
      setOutput(consoleOutput || 'Code executed successfully with no console output.');
    } catch (e: any) {
      setOutput(e.toString());
    } finally {
      document.body.removeChild(iframe);
    }
  };

  return (
    <div className="gradient-border">
      <div className="card p-4 bg-black/20 space-y-3">
        {!pairId && (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
            Go to Profile to connect with a partner and collaborate in the editor.
          </div>
        )}
        <div className="flex items-center justify-between">
          <select value={language} onChange={e => setLanguage(e.target.value)} className="input h-9 bg-gray-700 border-transparent focus:ring-pink-500 rounded-lg">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <button onClick={runCode} disabled={language !== 'javascript'} className="rounded-lg h-9 px-4 flex items-center gap-2 bg-pink-600 text-white hover:bg-pink-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
            <Play className="h-4 w-4" />
            <span>Run</span>
          </button>
        </div>
        <CodeMirror
          value={code}
          height="300px"
          theme={oneDark}
          extensions={extensions}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Input</h4>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="bg-gray-800 p-3 rounded-lg text-sm h-28 w-full overflow-y-auto font-mono focus:ring-pink-500 border-transparent"
              placeholder="Provide input to your code here... (available as a global 'input' variable)"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Output</h4>
            <pre className="bg-gray-800 p-3 rounded-lg text-sm h-28 w-full overflow-y-auto font-mono">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}