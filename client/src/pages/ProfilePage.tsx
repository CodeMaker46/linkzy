import { useAppStore } from '../store/useAppStore'
import { User } from 'lucide-react'
import Button from '../components/ui/button'
import { useState } from 'react'

export default function ProfilePage() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const setPartnerUid = useAppStore(s => s.setPartnerUid)
  const [partnerCode, setPartnerCode] = useState('')
  
  // Display first part of email as username
  const username = user?.email ? user.email.split('@')[0] : 'User'

  const handleConnect = () => {
    if (partnerCode.trim()) {
      setPartnerUid(partnerCode.trim())
      setPartnerCode('')
    }
  }

  const handleDisconnect = () => {
    setPartnerUid(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{username}</h3>
              <p className="opacity-70">{user?.email}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <div className="text-sm opacity-70 mb-1">Your User ID</div>
            <div className="bg-white/5 rounded-xl p-3 text-sm font-mono break-all">
              {user?.uid}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold">Partner Connection</h3>
          
          {!partnerUid ? (
            <div className="space-y-4">
              <p className="opacity-70">Connect with your partner by entering their User ID</p>
              
              <div className="space-y-2">
                <label htmlFor="partner-id" className="text-sm opacity-70">Partner's User ID</label>
                <input 
                  id="partner-id"
                  className="w-full input" 
                  placeholder="Enter partner's User ID" 
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                />
              </div>
              
              <Button onClick={handleConnect}>Connect Partner</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm opacity-70 mb-1">Connected Partner ID</div>
                <div className="font-mono break-all">{partnerUid}</div>
              </div>
              
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Partner
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}