import { useState } from 'react'
import { User, UserPlus } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from './ui/button'

export default function ProfileSection() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const setPartnerUid = useAppStore(s => s.setPartnerUid)
  const [partnerCode, setPartnerCode] = useState('')
  const [showConnect, setShowConnect] = useState(false)

  // Display first part of email as username
  const username = user?.email ? user.email.split('@')[0] : 'User'

  const handleConnect = () => {
    if (partnerCode.trim()) {
      setPartnerUid(partnerCode.trim())
      setShowConnect(false)
      setPartnerCode('')
    }
  }

  const handleDisconnect = () => {
    setPartnerUid(null)
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="card p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
          <User size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{username}</div>
          <div className="text-xs opacity-70 truncate">{user?.email}</div>
        </div>
      </div>

      {!showConnect && !partnerUid && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2"
          onClick={() => setShowConnect(true)}
        >
          <UserPlus size={14} />
          <span>Connect Partner</span>
        </Button>
      )}

      {showConnect && !partnerUid && (
        <div className="card p-3 space-y-2">
          <div className="text-sm font-medium">Connect to Partner</div>
          <div className="text-xs opacity-70">Enter your partner's user ID to connect</div>
          <div className="flex gap-2">
            <input 
              className="flex-1 input text-sm" 
              placeholder="Partner ID" 
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
            />
            <Button size="sm" onClick={handleConnect}>Connect</Button>
          </div>
          <div className="text-xs opacity-70 pt-1">Your ID: {user?.uid}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => setShowConnect(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {partnerUid && (
        <div className="card p-3 space-y-2">
          <div className="text-sm font-medium">Connected Partner</div>
          <div className="text-xs opacity-70 truncate">ID: {partnerUid}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  )
}