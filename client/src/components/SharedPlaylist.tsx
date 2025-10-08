import { useEffect, useMemo, useState } from 'react'
import { 
  addDoc, 
  collection, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp
} from 'firebase/firestore'
import type { 
  DocumentData,
  FieldValue,
  QueryDocumentSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

type Platform = 'spotify' | 'youtube'

// Define proper interfaces for our data
interface PlaylistItem {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  addedBy: string;
  timestamp: Date | null;
}

// Define the Firestore document structure
interface PlaylistDocument {
  platform: Platform;
  title: string;
  url: string;
  addedBy: string;
  timestamp: Timestamp | FieldValue | null;
}

// Helper function to safely convert Firestore document to our app model
function convertPlaylistDoc(doc: QueryDocumentSnapshot<DocumentData>): PlaylistItem {
  const data = doc.data();
  return {
    id: doc.id,
    platform: (data.platform as Platform) || 'spotify',
    title: data.title || '',
    url: data.url || '',
    addedBy: data.addedBy || '',
    timestamp: data.timestamp?.toDate() || null
  };
}

export default function SharedPlaylist() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const listRef = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'playlist') : null, [pairId])
  const [platform, setPlatform] = useState<Platform>('spotify')
  const [queryText, setQueryText] = useState('')
  const [items, setItems] = useState<PlaylistItem[]>([])

  useEffect(() => {
    if (!pairId || !listRef) return
    const q = query(listRef, orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => {
      const playlistItems = snap.docs.map(convertPlaylistDoc);
      setItems(playlistItems);
    })
  }, [pairId, listRef])

  async function addToPlaylist() {
    if (!pairId || !listRef || !user) return
    if (!queryText.trim()) return
    
    const newItem: PlaylistDocument = {
      platform,
      title: queryText.trim(),
      url: platform === 'spotify' ? `https://open.spotify.com/search/${encodeURIComponent(queryText)}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(queryText)}`,
      addedBy: user.uid,
      timestamp: serverTimestamp(),
    }
    
    await addDoc(listRef, newItem)
    setQueryText('')
  }

  return (
    <div className="space-y-3">
      <div className="card card-hover p-4 space-y-3">
        <div className="font-semibold text-lg">Add to Shared Playlist</div>
        {!pairId && (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">Go to Profile to connect with a partner and share a playlist.</div>
        )}
        <div className="flex gap-2">
          <select className="input" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
            <option value="spotify">Spotify</option>
            <option value="youtube">YouTube</option>
          </select>
          <input className="flex-1 input" placeholder="Search song or paste link" value={queryText} onChange={(e) => setQueryText(e.target.value)} />
          <button onClick={addToPlaylist} className="rounded-xl px-4 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 btn-shimmer">Add to Playlist</button>
        </div>
      </div>
      <div className="card card-hover p-4 space-y-2">
        <div className="font-semibold text-lg">Shared Playlist</div>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-pink-500/40 to-purple-600/40" />
                <span className="text-xs opacity-70 border border-white/10 rounded px-2 py-0.5 capitalize">{it.platform}</span>
                <a href={it.url} target="_blank" rel="noreferrer" className="hover:underline">{it.title}</a>
              </div>
              <span className="text-xs opacity-60">by {it.addedBy}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

