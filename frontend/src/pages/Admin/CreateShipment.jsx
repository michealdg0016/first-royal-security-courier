import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import api from '../../api/client'

const COUNTRIES = ['Afghanistan','Albania','Algeria','Angola','Argentina','Australia','Austria','Azerbaijan','Bahrain','Bangladesh','Belgium','Bolivia','Bosnia','Brazil','Bulgaria','Cambodia','Canada','Chile','China','Colombia','Croatia','Cuba','Czech Republic','Denmark','Ecuador','Egypt','Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Latvia','Lebanon','Libya','Lithuania','Malaysia','Mexico','Morocco','Mozambique','Myanmar','Netherlands','New Zealand','Nigeria','Norway','Oman','Pakistan','Panama','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Thailand','Tunisia','Turkey','UAE','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe']

const SERVICES = ['International Express','Secure Freight','Priority Royal','Corporate Solutions']

export default function CreateShipment() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    sender_name: '', sender_email: '',
    recipient_name: '', recipient_email: '', recipient_phone: '',
    origin_country: '', destination_country: '',
    package_description: '', weight: '', service_type: 'International Express',
    notes: '', estimated_delivery: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/shipments', form)
      setSuccess(data.shipment)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create shipment')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AdminLayout title="Shipment Created" subtitle="New shipment registered successfully">
        <div style={{maxWidth:560,margin:'0 auto'}}>
          <div className="card" style={{textAlign:'center',padding:48}}>
            <div style={{fontSize:64,marginBottom:20}}>✅</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:'var(--cream)',marginBottom:8}}>Shipment Registered!</h2>
            <p style={{color:'var(--text-muted)',marginBottom:28}}>The shipment has been created and is ready to track.</p>

            <div style={{background:'rgba(201,162,39,0.08)',border:'1px solid rgba(201,162,39,0.2)',borderRadius:12,padding:24,marginBottom:28}}>
              <p style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Tracking Code</p>
              <p style={{fontFamily:'Courier New,monospace',fontSize:26,fontWeight:700,color:'var(--gold-400)',letterSpacing:'2px'}}>{success.tracking_code}</p>
              <p style={{fontSize:13,color:'var(--text-muted)',marginTop:8}}>Share this code with the sender for tracking</p>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn btn-gold" onClick={() => navigate(`/track/${success.tracking_code}`)}>View Tracking Page</button>
              <button className="btn btn-outline" onClick={() => navigate('/admin/shipments')}>All Shipments</button>
              <button className="btn btn-ghost" onClick={() => { setSuccess(null); setForm({sender_name:'',sender_email:'',recipient_name:'',recipient_email:'',recipient_phone:'',origin_country:'',destination_country:'',package_description:'',weight:'',service_type:'International Express',notes:'',estimated_delivery:''}) }}>Create Another</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="New Shipment" subtitle="Register a new international shipment">
      <div style={{maxWidth:760,margin:'0 auto'}}>
        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={submit}>
          {/* Sender */}
          <div className="card" style={{marginBottom:20}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'var(--gold-400)',marginBottom:20,fontSize:18}}>📤 Sender Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sender Full Name *</label>
                <input name="sender_name" className="form-input" placeholder="John Smith" value={form.sender_name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sender Email *</label>
                <input name="sender_email" type="email" className="form-input" placeholder="john@example.com" value={form.sender_email} onChange={handle} required />
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="card" style={{marginBottom:20}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'var(--gold-400)',marginBottom:20,fontSize:18}}>📥 Recipient Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input name="recipient_name" className="form-input" placeholder="Jane Doe" value={form.recipient_name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Recipient Email *</label>
                <input name="recipient_email" type="email" className="form-input" placeholder="jane@example.com" value={form.recipient_email} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Recipient Phone</label>
              <input name="recipient_phone" className="form-input" placeholder="+1 555 000 0000" value={form.recipient_phone} onChange={handle} />
            </div>
          </div>

          {/* Route */}
          <div className="card" style={{marginBottom:20}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'var(--gold-400)',marginBottom:20,fontSize:18}}>🌍 Route</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Origin Country *</label>
                <select name="origin_country" className="form-select" value={form.origin_country} onChange={handle} required>
                  <option value="">Select origin country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination Country *</label>
                <select name="destination_country" className="form-select" value={form.destination_country} onChange={handle} required>
                  <option value="">Select destination country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Package */}
          <div className="card" style={{marginBottom:20}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'var(--gold-400)',marginBottom:20,fontSize:18}}>📦 Package Details</h3>
            <div className="form-group">
              <label className="form-label">Package Description *</label>
              <input name="package_description" className="form-input" placeholder="e.g. Electronics - Laptop Computer" value={form.package_description} onChange={handle} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input name="weight" type="number" step="0.1" min="0.1" className="form-input" placeholder="1.5" value={form.weight} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select name="service_type" className="form-select" value={form.service_type} onChange={handle}>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estimated Delivery Date</label>
                <input name="estimated_delivery" type="date" className="form-input" value={form.estimated_delivery} onChange={handle} />
              </div>
              <div />
            </div>
            <div className="form-group">
              <label className="form-label">Internal Notes</label>
              <textarea name="notes" className="form-textarea" rows={3} placeholder="Any special handling instructions or internal notes..." value={form.notes} onChange={handle} />
            </div>
          </div>

          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/shipments')}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? 'Creating...' : '👑 Register Shipment'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
