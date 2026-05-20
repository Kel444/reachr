'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const G: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18,
}

export default function SettingsPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', email: '', company: '', vat_number: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      setForm({
        full_name: data?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        company: data?.company || '',
        vat_number: data?.vat_number || '',
        address: data?.address || '',
      })
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      full_name: form.full_name,
      company: form.company || null,
      vat_number: form.vat_number || null,
      address: form.address || null,
    }, { onConflict: 'user_id' })
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match'); return }
    setPwSaving(true); setPwMsg('')
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { setPwMsg('Error: ' + error.message) }
    else { setPwMsg('Password updated!'); setPwForm({ current: '', next: '', confirm: '' }) }
    setPwSaving(false)
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)', padding: 40 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Manage your account and billing details</p>
      </div>

      {/* Profile */}
      <div style={{ ...G, padding: '28px 32px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 22 }}>Profile</h2>
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Full name</label>
              <input value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Email</label>
              <input value={form.email} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Company name</label>
            <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Your company or creator name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>VAT number</label>
              <input value={form.vat_number} onChange={e => setForm(f => ({...f, vat_number: e.target.value}))} placeholder="FR12345678901" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Address</label>
              <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="123 Main St, Paris" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} style={{
              padding: '10px 24px', borderRadius: 10, cursor: 'pointer',
              background: saved ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #7832FF, #FF2D78)',
              color: saved ? '#22C55E' : '#fff', fontSize: 14, fontWeight: 600,
              border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none',
            } as React.CSSProperties}>
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div style={{ ...G, padding: '28px 32px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 22 }}>Change password</h2>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>New password</label>
            <input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({...f, next: e.target.value}))} placeholder="Min 6 characters" minLength={6} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Confirm password</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} placeholder="Same as above" required />
          </div>
          {pwMsg && <p style={{ fontSize: 13, color: pwMsg.includes('Error') ? '#F87171' : '#22C55E', background: pwMsg.includes('Error') ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)', padding: '8px 12px', borderRadius: 8 }}>{pwMsg}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={pwSaving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
              {pwSaving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
