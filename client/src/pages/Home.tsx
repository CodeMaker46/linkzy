import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { LayoutGrid, MessageCircle, Music, Code, Wallet, Image as ImageIcon } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Welcome to Linkzy" subtitle="Your private space to study, create, and grow together." icon={<LayoutGrid />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card to="/dashboard" title="Dashboard" desc="Daily summary, moods, countdowns." icon={<LayoutGrid size={16} />} />
        <Card to="/chat" title="Chat" desc="Private real-time messages." icon={<MessageCircle size={16} />} />
        <Card to="/music" title="Music" desc="Shared playlists and memes." icon={<Music size={16} />} />
        <Card to="/coding" title="Coding" desc="Collaborative editor & challenges." icon={<Code size={16} />} />
        <Card to="/expenses" title="Wallet" desc="Track shared expenses." icon={<Wallet size={16} />} />
        <Card to="/memories" title="Memories" desc="Photos, diary and countdowns." icon={<ImageIcon size={16} />} />
      </div>
    </div>
  )
}

function Card({ to, title, desc, icon }: { to: string; title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <Link to={to} className="card card-hover p-5">
      <div className="text-lg font-semibold flex items-center gap-2">{icon}{title}</div>
      <div className="opacity-70 text-sm">{desc}</div>
    </Link>
  )
}

