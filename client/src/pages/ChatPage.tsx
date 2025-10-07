import ChatBox from '../components/ChatBox'
import PairSetup from '../components/PairSetup'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chat</h2>
      <PairSetup />
      <ChatBox />
    </div>
  )
}

