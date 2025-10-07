import { useNavigate } from 'react-router-dom'
import Button from './ui/button'
import { useAuth } from '../hooks/useAuth'

export default function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  async function handle() {
    try {
      await signOut()
    } finally {
      navigate('/login')
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={handle}>
      Logout
    </Button>
  )
}

