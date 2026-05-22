import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import api from '../../api/client'

const STATUSES = ['Order Placed','Package Picked Up','Processing at Origin Hub','Departed Origin Country','In Transit (International)','Arrived at Destination Country','Customs Clearance','At Delivery Hub','Out for Delivery','Delivered']
const STATUS_COLORS = ['badge-grey','badge-blue','badge-blue','badge-orange','badge-amber','badge-teal','badge-purple','badge-indigo','badge-green','badge-green']
const STATUS_ICONS = ['📋','📦','🏭','✈️','🌍','🛬','🏛️','🏪','🚚','✅']

function statusBadge(s, f) { return f ? 'badge-red' : STATUS_COLORS[STATUSES.indexOf(s)] || 'badge-grey' }

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  )
}

export default function AdminShipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [frozenFilter, setFrozenFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'progress'|'regress'|'freeze'|'unfreeze'|'setstatus'|'delete'|'delivery'
  const [toasts, setToasts] = useState([])
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [setStatusIdx, setSetStatusIdx] = useState(0)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [freezeReason, setFreezeReason] = useState('')
  const [freezeHub, setFreezeHub] = useState('')
  const [freezeCity, setFreezeCity] = useState('')
  const [freezeCountry, setFreezeCountry] = useState('')
  const [history, setHistory] = useState([])
  const [searchParams] = useSearchParams()

  const toast = (msg, type = 'ok') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (filter) params.status = filter
    if (frozenFilter) params.frozen = frozenFilter
    const { data } = await api.get('/admin/shipments', { params })
    setShipments(data.shipments)
    setLoading(false)
  }, [search, filter, frozenFilter])

  useEffect(() => { load() }, [load])

  const openDetail = async (s) => {
    setSelected(s)
    const { data } = await api.get(`/admin/shipments/${s.id}`)
    setSelected(data.shipment)
    setHistory(data.history)
    setModal('detail')
  }

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      api.get(`/admin/shipments/${id}`).then(r => { setSelected(r.data.shipment); setHistory(r.data.history); setModal('detail') })
    }
  }, [])

  const closeModal = () => { setModal(null); setNote(''); setLocation(''); setFreezeReason(''); setFreezeHub(''); setFreezeCity(''); setFreezeCountry(''); setDeliveryDate('') }

  const act = async (action, extra = {}) => {
    try {
      let res
      if (action === 'progress') res = await api.patch(`/admin/shipments/${selected.id}/progress`, { note, location })
      else if (action === 'regress') res = await api.patch(`/admin/shipments/${selected.id}/regress`)
      else if (action === 'freeze') {
        const freezeLocation = [freezeHub, freezeCity, freezeCountry].filter(Boolean).join(', ')
        res = await api.patch(`/admin/shipments/${selected.id}/freeze`, { reason: freezeReason, location: freezeLocation })
      }
      else if (action === 'unfreeze') res = await api.patch(`/admin/shipments/${selected.id}/unfreeze`)
      else if (action === 'setstatus') res = await api.patch(`/admin/shipments/${selected.id}/set-status`, { status_index: setStatusIdx, note })
      else if (action === 'delivery') res = await api.patch(`/admin/shipments/${selected.id}/update-delivery`, { estimated_delivery: deliveryDate })
      else if (action === 'delete') { await api.delete(`/admin/shipments/${selected.id}`); toast('Shipment deleted', 'warn'); closeModal(); setSelected(null); load(); return }

      if (res?.data?.shipment) {
        setSelected(res.data.shipment)
        const updated = await api.get(`/admin/shipments/${selected.id}`)
        setHistory(updated.data.history)
        toast(`✓ ${action.charAt(0).toUpperCase() + action.slice(1)} successful`)
        closeModal()
        load()
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Action failed', 'err')
    }
  }

  return (
    <AdminLayout title="Shipment Control" subtitle={`${shipments.length} shipments — full management`}>
      <Toast toasts={toasts} />

      {/* Filters */}
      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search tracking code, name, country..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{width:'auto'}} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{width:'auto'}} value={frozenFilter} onChange={e => setFrozenFilter(e.target.value)}>
          <option value="">All States</option>
          <option value="true">❄️ On Hold</option>
          <option value="false">Active Only</option>
        </select>
        <Link to="/admin/shipments/new" className="btn btn-gold btn-sm">+ New</Link>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <div className="table-head">
            <span className="table-head-title">All Shipments ({shipments.length})</span>
          </div>
          {shipments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3 className="empty-title">No shipments found</h3></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Route</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id}>
                    <td><span className="tc-cell">{s.tracking_code}</span></td>
                    <td style={{fontSize:13}}>{s.sender_name}</td>
                    <td style={{fontSize:13}}>{s.recipient_name}</td>
                    <td style={{fontSize:12,color:'var(--text-muted)'}}>{s.origin_country} → {s.destination_country}</td>
                    <td><span className="badge badge-gold" style={{fontSize:10}}>{s.service_type}</span></td>
                    <td>
                      <span className={`badge ${statusBadge(s.status, s.is_frozen)}`}>
                        {s.is_frozen ? '❄️ On Hold' : s.status}
                      </span>
                    </td>
                    <td style={{fontSize:13}}>{s.weight} kg</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(s)}>Manage</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail / Management Modal */}
      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{maxWidth:680}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
              <div>
                <h2 className="modal-title">📦 {selected.tracking_code}</h2>
                <p className="modal-sub">{selected.sender_name} → {selected.recipient_name} &nbsp;·&nbsp; {selected.origin_country} → {selected.destination_country}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>

            {selected.is_frozen && <div className="frozen-bar">❄️ This shipment is currently ON HOLD</div>}

            {/* Status line */}
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 0',borderTop:'1px solid var(--border-light)',borderBottom:'1px solid var(--border-light)',marginBottom:20}}>
              <span style={{fontSize:24}}>{STATUS_ICONS[STATUSES.indexOf(selected.status)] || '📦'}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,color:'var(--text-muted)'}}>Current Status</p>
                <p style={{fontWeight:600,color:'var(--cream)'}}>{selected.status}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:12,color:'var(--text-muted)'}}>Progress</p>
                <p style={{fontWeight:700,color:'var(--gold-400)'}}>{STATUSES.indexOf(selected.status) + 1} / {STATUSES.length}</p>
              </div>
            </div>

            {/* Info grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
              {[
                ['Sender', selected.sender_name],
                ['Sender Email', selected.sender_email],
                ['Recipient', selected.recipient_name],
                ['Recipient Email', selected.recipient_email],
                ['Origin', selected.origin_country],
                ['Destination', selected.destination_country],
                ['Package', selected.package_description],
                ['Weight', `${selected.weight} kg`],
                ['Service', selected.service_type],
                ['Est. Delivery', selected.estimated_delivery || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 14px'}}>
                  <p style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>{k}</p>
                  <p style={{fontSize:14,color:'var(--text-primary)',fontWeight:500}}>{v}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{marginBottom:20}}>
              <p style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:10}}>Actions</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {!selected.is_frozen && selected.status_index < 9 && (
                  <button className="btn btn-success btn-sm" onClick={() => setModal('progress')}>⬆ Progress Status</button>
                )}
                {!selected.is_frozen && selected.status_index > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => act('regress')}>⬇ Step Back</button>
                )}
                <button className="btn btn-gold btn-sm" onClick={() => { setSetStatusIdx(selected.status_index); setModal('setstatus') }}>🎯 Set Status</button>
                <button className="btn btn-gold btn-sm" onClick={() => { setDeliveryDate(selected.estimated_delivery || ''); setModal('delivery') }}>📅 Edit Delivery Date</button>
                {!selected.is_frozen
                  ? <button className="btn btn-danger btn-sm" onClick={() => setModal('freeze')}>❄️ Freeze Shipment</button>
                  : <button className="btn btn-success btn-sm" onClick={() => act('unfreeze')}>🔥 Unfreeze</button>
                }
                <button className="btn btn-danger btn-sm" style={{background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)'}} onClick={() => setModal('delete')}>🗑 Delete</button>
              </div>
            </div>

            {/* History */}
            <div>
              <p style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12}}>Status History ({history.length})</p>
              <div style={{maxHeight:200,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
                {[...history].reverse().map(h => (
                  <div key={h.id} style={{display:'flex',gap:12,padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:8}}>
                    <span style={{fontSize:16,flexShrink:0}}>{h.status === 'On Hold' ? '❄️' : STATUS_ICONS[STATUSES.indexOf(h.status)] || '📍'}</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{h.status}</p>
                      {h.note && <p style={{fontSize:12,color:'var(--text-muted)'}}>{h.note}</p>}
                      {h.location && <p style={{fontSize:11,color:'var(--text-muted)'}}>📍 {h.location}</p>}
                    </div>
                    <p style={{fontSize:11,color:'var(--text-muted)',whiteSpace:'nowrap'}}>
                      {new Date(h.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {modal === 'progress' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">⬆ Progress Shipment</h2>
            <p className="modal-sub">Move to next status: <strong style={{color:'var(--gold-400)'}}>{STATUSES[(STATUSES.indexOf(selected.status) || 0) + 1]}</strong></p>
            <div className="form-group">
              <label className="form-label">Status Note (Optional)</label>
              <input className="form-input" placeholder="e.g. Package cleared security screening" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location (Optional)</label>
              <input className="form-input" placeholder="e.g. Heathrow Hub, London" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal('detail')}>Cancel</button>
              <button className="btn btn-success" onClick={() => act('progress')}>Confirm Progress ⬆</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Status Modal */}
      {modal === 'setstatus' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">🎯 Set Status Directly</h2>
            <p className="modal-sub">Jump to any stage in the delivery pipeline</p>
            <div className="form-group">
              <label className="form-label">Target Status</label>
              <select className="form-select" value={setStatusIdx} onChange={e => setSetStatusIdx(parseInt(e.target.value))}>
                {STATUSES.map((s, i) => <option key={s} value={i}>{STATUS_ICONS[i]} {s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <input className="form-input" placeholder="Reason for manual status change" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal('detail')}>Cancel</button>
              <button className="btn btn-gold" onClick={() => act('setstatus')}>Set Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {modal === 'freeze' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">❄️ Freeze Shipment</h2>
            <p className="modal-sub">This shipment will be placed on hold. Progress will be paused until unfrozen.</p>
            <div className="form-group">
              <label className="form-label">Reason for Hold</label>
              <textarea className="form-textarea" rows={3} placeholder="e.g. Awaiting customs documentation, payment verification required..." value={freezeReason} onChange={e => setFreezeReason(e.target.value)} />
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',margin:'16px 0 10px'}}>Current Location</p>
            <div className="form-group">
              <label className="form-label">Facility / Hub Name <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
              <input className="form-input" placeholder="e.g. Customs Inspection Facility, Terminal 3" value={freezeHub} onChange={e => setFreezeHub(e.target.value)} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Frankfurt" value={freezeCity} onChange={e => setFreezeCity(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" placeholder="e.g. Germany" value={freezeCountry} onChange={e => setFreezeCountry(e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal('detail')}>Cancel</button>
              <button className="btn btn-danger" onClick={() => act('freeze')}>❄️ Freeze Shipment</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Date Modal */}
      {modal === 'delivery' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">📅 Update Estimated Delivery</h2>
            <p className="modal-sub">Set the expected delivery date for this shipment</p>
            <div className="form-group">
              <label className="form-label">Estimated Delivery Date</label>
              <input type="date" className="form-input" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal('detail')}>Cancel</button>
              <button className="btn btn-gold" onClick={() => act('delivery')}>Update Date</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {modal === 'delete' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title" style={{color:'#f87171'}}>🗑 Delete Shipment</h2>
            <p className="modal-sub">This will permanently delete <strong style={{color:'var(--gold-400)'}}>{selected?.tracking_code}</strong> and all its history. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal('detail')}>Cancel</button>
              <button className="btn btn-danger" onClick={() => act('delete')}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
