import ChatBox from '../components/ChatBox'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <ChatBox />
    </div>
  )
}
