'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 18,
}

const STATUSES = ['lead','negotiation','contract','invoiced','paid','cancelled']
const STATUS_COLORS: Record<string,string> = {
  lead: '#6366F1', negotiation: '#F59E0B', contract: '#10B981',
  invoiced: '#3B82F6', paid: '#22C55E', cancelled: '#6B7280',
}

interface Deal {
  id: string; sponsor_name: string; amount: number; currency: string;
  status: string; platform: string; created_at: string;
}

export default function DashboardPage() {
  const supabase = createClient()
  const [deals, setDeals] = useState<Deal[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there')
        const { data } = await supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        setDeals(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalPaid = deals.filter(d => d.status === 'paid').reduce((s, d) => s + (d.amount || 0), 0)
  const totalPending = deals.filter(d => ['invoiced','contract','negotiation'].includes(d.status)).reduce((s, d) => s + (d.amount || 0), 0)
  const activeDeals = deals.filter(d => !['paid','cancelled'].includes(d.status)).length
  const recentDeals = deals.slice(0, 5)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading...</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Hey, {userName} 👋</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Here's your sponsoring overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Revenue collected', value: `€${totalPaid.toLocaleString()}`, icon: '💰', color: '#22C55E' },
          { label: 'Pipeline value', value: `€${totalPending.toLocaleString()}`, icon: '📈', color: '#A78BFA' },
          { label: 'Active deals', value: activeDeals, icon: '🤝', color: '#60A5FA' },
        ].map(stat => (
          <div key={stat.label} style={{ ...G, padding: '24px 28px' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline by status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ ...G, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Pipeline by stage</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STATUSES.filter(s => s !== 'cancelled').map(status => {
              const count = deals.filter(d => d.status === status).length
              const value = deals.filter(d => d.status === status).reduce((s, d) => s + (d.amount || 0), 0)
              const maxCount = Math.max(...STATUSES.map(s => deals.filter(d => d.status === s).length), 1)
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ textTransform: 'capitalize', color: 'rgba(255,255,255,0.7)' }}>{status}</span>
                    <span style={{ color: STATUS_COLORS[status], fontWeight: 600 }}>
                      {count} deal{count !== 1 ? 's' : ''} · €{value.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: 4, borderRadius: 2, width: `${(count / maxCount) * 100}%`, background: STATUS_COLORS[status], transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ ...G, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Recent deals</h2>
          {recentDeals.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, paddingTop: 20 }}>
              No deals yet — <a href="/deals" style={{ color: '#A78BFA' }}>add your first one</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentDeals.map(deal => (
                <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{deal.sponsor_name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{deal.platform}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>€{(deal.amount||0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: STATUS_COLORS[deal.status], textTransform: 'capitalize' }}>{deal.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
