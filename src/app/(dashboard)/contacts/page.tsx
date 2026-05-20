'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18,
}

interface Contact {
  id: string; user_id: string; company_name: string; contact_name?: string;
  email?: string; phone?: string; notes?: string; created_at: string;
}

const EMPTY = { company_name: '', contact_name: '', email: '', phone: '', notes: '' }

export default function ContactsPage() {
  const supabase = createClient()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('contacts').select('*').eq('user_id', user.id).order('company_name')
    setContacts(data || [])
    setLoading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { user_id: user.id, ...form, contact_name: form.contact_name || null, email: form.email || null, phone: form.phone || null, notes: form.notes || null }
    if (editId) { await supabase.from('contacts').update(payload).eq('id', editId) }
    else { await supabase.from('contacts').insert(payload) }
    setSaving(false); setShowForm(false); setForm(EMPTY); setEditId(null); load()
  }

  async function del(id: string) {
    if (!confirm('Delete this contact?')) return
    await supabase.from('contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const filtered = contacts.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Contacts</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Your sponsor address book</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true) }} style={{
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #7832FF, #FF2D78)', color: '#fff', fontSize: 14, fontWeight: 600,
        }}>+ New Contact</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search contacts..." style={{ maxWidth: 320 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading...</div>
        : filtered.length === 0 ? (
          <div style={{ ...G, padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, gridColumn: '1/-1' }}>
            {search ? 'No contacts match your search' : 'No contacts yet'}
          </div>
        ) : filtered.map(c => (
          <div key={c.id} style={{ ...G, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, fontSize: 18,
                background: 'linear-gradient(135deg, rgba(120,50,255,0.3), rgba(255,45,120,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>🏢</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setForm({ company_name: c.company_name, contact_name: c.contact_name||'', email: c.email||'', phone: c.phone||'', notes: c.notes||'' }); setEditId(c.id); setShowForm(true) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: 13 }}>🗑</button>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{c.company_name}</div>
            {c.contact_name && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{c.contact_name}</div>}
            {c.email && <a href={`mailto:${c.email}`} style={{ display: 'block', fontSize: 12, color: '#A78BFA', textDecoration: 'none', marginBottom: 2 }}>✉️ {c.email}</a>}
            {c.phone && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📞 {c.phone}</div>}
            {c.notes && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, lineHeight: 1.5 }}>{c.notes}</div>}
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ ...G, width: 460, padding: '32px 36px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{editId ? 'Edit contact' : 'New contact'}</h2>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Company *</label>
                <input value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} placeholder="Nike, Squarespace..." required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Contact name</label>
                <input value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} placeholder="John Smith" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="john@brand.com" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="How you met, preferences..." style={{ minHeight: 70, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7832FF, #FF2D78)', color: '#fff', fontSize: 14, fontWeight: 600 }}>{saving ? 'Saving...' : editId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
