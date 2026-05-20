'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse 70% 55% at 10% 5%, rgba(120,50,255,0.28) 0%, transparent 55%), #07070F`
    }}>
      <div style={{
        width: 400, background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24, padding: '48px 40px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>.<br />
          Click it to activate your account.
        </p>
        <Link href="/login" style={{
          display: 'block', marginTop: 24, padding: '12px',
          background: 'rgba(255,255,255,0.08)', borderRadius: 12,
          color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500
        }}>Back to login</Link>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(ellipse 70% 55% at 10% 5%, rgba(120,50,255,0.28) 0%, transparent 55%),
        radial-gradient(ellipse 55% 45% at 90% 95%, rgba(255,45,120,0.20) 0%, transparent 50%),
        #07070F
      `
    }}>
      <div style={{
        width: 400, background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '48px 40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #7832FF, #FF2D78)', marginBottom: 16, fontSize: 26,
          }}>🤝</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Create account</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Start tracking your brand deals</p>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6 }}>Full name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} required />
          </div>
          {error && <p style={{ color: '#FF6B6B', fontSize: 13, background: 'rgba(255,107,107,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            marginTop: 8, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7832FF, #FF2D78)',
            color: '#fff', fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
