'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/deals', icon: '🤝', label: 'Deals' },
  { href: '/payments', icon: '💳', label: 'Payments' },
  { href: '/contacts', icon: '👥', label: 'Contacts' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', position: 'sticky', top: 0,
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
      borderRight: '1px solid rgba(255,255,255,0.09)',
      display: 'flex', flexDirection: 'column', padding: '24px 0',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7832FF, #FF2D78)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🤝</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Reachr</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => {
          const active = path === item.href || path.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: active ? 'rgba(120,50,255,0.2)' : 'transparent',
              border: active ? '1px solid rgba(120,50,255,0.3)' : '1px solid transparent',
              color: active ? '#C4B5FD' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 12px' }}>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'rgba(255,255,255,0.4)',
          fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          <span style={{ fontSize: 16 }}>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
