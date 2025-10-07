import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/button'

export default function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInEmail(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signUpEmail(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      await signInGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold gradient-text">Welcome to Linkzy</h1>
      <form className="space-y-3" onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl bg-transparent border border-white/10 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-pink-400 text-sm">{error}</div>}
        <div className="flex gap-2">
          <Button disabled={loading} type="submit">Sign In</Button>
          <Button disabled={loading} type="button" variant="outline" onClick={handleSignUp}>Sign Up</Button>
        </div>
      </form>
      <div className="pt-2">
        <Button disabled={loading} variant="secondary" onClick={handleGoogle} className="w-full">Continue with Google</Button>
      </div>
    </div>
  )
}

