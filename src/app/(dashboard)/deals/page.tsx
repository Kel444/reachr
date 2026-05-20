'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18,
}

const STATUSES = [
  { key: 'lead', label: '🎯 Lead', color: '#6366F1' },
  { key: 'negotiation', label: '💬 Negotiation', color: '#F59E0B' },
  { key: 'contract', label: '📄 Contract', color: '#10B981' },
  { key: 'invoiced', label: '🧾 Invoiced', color: '#3B82F6' },
  { key: 'paid', label: '✅ Paid', color: '#22C55E' },
]

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Podcast', 'Newsletter', 'Twitch', 'Other']

interface Deal {
  id: string; user_id: string; sponsor_name: string; contact_name?: string;
  contact_email?: string; status: string; amount: number; currency: string;
  platform: string; notes?: string; publish_date?: string; payment_date?: string; created_at: string;
}

const EMPTY_FORM = {
  sponsor_name: '', contact_name: '', contact_email: '', status: 'lead',
  amount: '', currency: 'EUR', platform: 'YouTube', notes: '',
  publish_date: '', payment_date: '',
}

export default function DealsPage() {
  const supabase = createClient()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { loadDeals() }, [])

  async function loadDeals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setDeals(data || [])
    setLoading(false)
  }

  async function saveDeal(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id,
      sponsor_name: form.sponsor_name,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      status: form.status,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      platform: form.platform,
      notes: form.notes || null,
      publish_date: form.publish_date || null,
      payment_date: form.payment_date || null,
    }
    if (editId) {
      await supabase.from('deals').update(payload).eq('id', editId)
    } else {
      await supabase.from('deals').insert(payload)
    }
    setSaving(false); setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
    loadDeals()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('deals').update({ status }).eq('id', id)
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  async function deleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return
    await supabase.from('deals').delete().eq('id', id)
    setDeals(prev => prev.filter(d => d.id !== id))
  }

  function openEdit(deal: Deal) {
    setForm({
      sponsor_name: deal.sponsor_name, contact_name: deal.contact_name || '',
      contact_email: deal.contact_email || '', status: deal.status,
      amount: deal.amount?.toString() || '', currency: deal.currency || 'EUR',
      platform: deal.platform || 'YouTube', notes: deal.notes || '',
      publish_date: deal.publish_date || '', payment_date: deal.payment_date || '',
    })
    setEditId(deal.id); setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Deals</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Your brand deal pipeline</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }} style={{
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #7832FF, #FF2D78)', color: '#fff', fontSize: 14, fontWeight: 600,
        }}>+ New Deal</button>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, overflowX: 'auto' }}>
        {STATUSES.map(col => {
          const colDeals = deals.filter(d => d.status === col.key)
          const colTotal = colDeals.reduce((s, d) => s + (d.amount || 0), 0)
          return (
            <div key={col.key}>
              <div style={{ marginBottom: 12, padding: '0 4px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: col.color }}>{col.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {colDeals.length} · €{colTotal.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colDeals.map(deal => (
                  <div key={deal.id} style={{ ...G, padding: '14px 16px', cursor: 'pointer' }}
                    onClick={() => openEdit(deal)}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{deal.sponsor_name}</div>
                    {deal.platform && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>{deal.platform}</div>}
                    <div style={{ fontSize: 16, fontWeight: 700, color: col.color, marginBottom: 10 }}>€{(deal.amount||0).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {STATUSES.filter(s => s.key !== deal.status).map(s => (
                        <button key={s.key} onClick={e => { e.stopPropagation(); updateStatus(deal.id, s.key) }}
                          style={{
                            fontSize: 10, padding: '3px 7px', borderRadius: 6, border: `1px solid ${s.color}44`,
                            background: `${s.color}18`, color: s.color, cursor: 'pointer',
                          }}>
                          → {s.label.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteDeal(deal.id) }}
                      style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,80,80,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      🗑 Delete
                    </button>
                  </div>
                ))}
                {colDeals.length === 0 && (
                  <div style={{ ...G, padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{
            ...G, width: 520, maxHeight: '90vh', overflow: 'auto', padding: '32px 36px',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {editId ? 'Edit deal' : 'New deal'}
            </h2>
            <form onSubmit={saveDeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Sponsor *</label>
                  <input value={form.sponsor_name} onChange={e => setForm(f => ({...f, sponsor_name: e.target.value}))} placeholder="Nike, Squarespace..." required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Platform</label>
                  <select value={form.platform} onChange={e => setForm(f => ({...f, platform: e.target.value}))}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Contact name</label>
                  <input value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} placeholder="John Smith" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Contact email</label>
                  <input type="email" value={form.contact_email} onChange={e => setForm(f => ({...f, contact_email: e.target.value}))} placeholder="john@brand.com" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Amount *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="2500" required min="0" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}>
                    {['EUR','USD','GBP'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Publish date</label>
                  <input type="date" value={form.publish_date} onChange={e => setForm(f => ({...f, publish_date: e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Payment due</label>
                  <input type="date" value={form.payment_date} onChange={e => setForm(f => ({...f, payment_date: e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Brief specs, deliverables, requirements..."
                  style={{ minHeight: 80, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14,
                }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7832FF, #FF2D78)', color: '#fff', fontSize: 14, fontWeight: 600,
                }}>{saving ? 'Saving...' : editId ? 'Save changes' : 'Create deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
