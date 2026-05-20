'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18,
}

interface Deal {
  id: string; sponsor_name: string; amount: number; currency: string;
  status: string; platform: string; payment_date?: string; publish_date?: string;
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'pending'|'paid'|'overdue'>('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('deals').select('*').eq('user_id', user.id)
        .in('status', ['invoiced','paid','contract','negotiation'])
        .order('payment_date', { ascending: true })
      setDeals(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const isOverdue = (d: Deal) => d.status !== 'paid' && d.payment_date && new Date(d.payment_date) < now

  const filtered = deals.filter(d => {
    if (filter === 'paid') return d.status === 'paid'
    if (filter === 'overdue') return isOverdue(d)
    if (filter === 'pending') return d.status !== 'paid' && !isOverdue(d)
    return true
  })

  const totalPaid = deals.filter(d => d.status === 'paid').reduce((s, d) => s + d.amount, 0)
  const totalPending = deals.filter(d => d.status !== 'paid').reduce((s, d) => s + d.amount, 0)
  const overdueCount = deals.filter(d => isOverdue(d)).length

  async function markPaid(id: string) {
    await supabase.from('deals').update({ status: 'paid' }).eq('id', id)
    setDeals(prev => prev.map(d => d.id === id ? {...d, status: 'paid'} : d))
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Payments</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Track what you've been paid and what's coming</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Collected', value: `€${totalPaid.toLocaleString()}`, color: '#22C55E', icon: '✅' },
          { label: 'Awaiting', value: `€${totalPending.toLocaleString()}`, color: '#A78BFA', icon: '⏳' },
          { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? '#F87171' : '#6B7280', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} style={{ ...G, padding: '22px 26px' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all','pending','paid','overdue'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
            background: filter === f ? 'rgba(120,50,255,0.3)' : 'rgba(255,255,255,0.06)',
            color: filter === f ? '#C4B5FD' : 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: filter === f ? 600 : 400,
            border: filter === f ? '1px solid rgba(120,50,255,0.4)' : '1px solid transparent',
          } as React.CSSProperties}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...G, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Sponsor', 'Platform', 'Amount', 'Payment due', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No payments to show</td></tr>
            ) : filtered.map((deal, i) => {
              const overdue = isOverdue(deal)
              return (
                <tr key={deal.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500 }}>{deal.sponsor_name}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{deal.platform}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600 }}>€{(deal.amount||0).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: overdue ? '#F87171' : 'rgba(255,255,255,0.5)' }}>
                    {deal.payment_date ? new Date(deal.payment_date).toLocaleDateString('en-GB') : '—'}
                    {overdue && ' ⚠️'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 20,
                      background: deal.status === 'paid' ? 'rgba(34,197,94,0.15)' : overdue ? 'rgba(248,113,113,0.15)' : 'rgba(167,139,250,0.15)',
                      color: deal.status === 'paid' ? '#22C55E' : overdue ? '#F87171' : '#A78BFA',
                      textTransform: 'capitalize',
                    } as React.CSSProperties}>{deal.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {deal.status !== 'paid' && (
                      <button onClick={() => markPaid(deal.id)} style={{
                        fontSize: 12, padding: '5px 12px', borderRadius: 8,
                        border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)',
                        color: '#22C55E', cursor: 'pointer',
                      }}>Mark paid ✓</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
