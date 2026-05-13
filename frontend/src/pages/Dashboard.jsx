import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ─── helpers ──────────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

const actDot = (status) =>
  ({ approved: 'green', pending: 'yellow', rejected: 'red', archived: 'gray' }[status] || 'blue')

/* ─── StatusBadge ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const cls = {
    approved: 'badge-approved',
    pending:  'badge-pending',
    rejected: 'badge-rejected',
    archived: 'badge-pending',
  }
  const lbl = {
    approved: 'Approved',
    pending:  'Pending...',
    rejected: 'Rejected',
    archived: 'Archived',
  }
  return (
    <span className={`badge ${cls[status] || 'badge-review'}`}>
      {lbl[status] || 'In review'}
    </span>
  )
}

/* ─── Toast ────────────────────────────────────────────── */
let _toastTimer
function showToast(msg) {
  const el = document.getElementById('dt-toast')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  clearTimeout(_toastTimer)
  _toastTimer = setTimeout(() => { el.style.display = 'none' }, 2800)
}

/* ─── Authenticated file download ─────────────────────── */
// NOTE: Uses axios (which injects the Bearer token) instead of
// a plain <a href> — that's why process.env is NOT needed here.
async function downloadFile(docId, fileName) {
  try {
    const res = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', fileName || `document-${docId}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    showToast('❌ Download failed. File may not exist.')
  }
}

/* ─── Doc Detail Modal ─────────────────────────────────── */
function DocModal({ doc, onClose }) {
  if (!doc) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h3>📄 Document Details</h3>

        <div className="detail-card">
          <div className="dl">Title</div>
          <div className="dv">{doc.title}</div>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <div className="dl">Status</div>
            <div className="dv"><StatusBadge status={doc.status} /></div>
          </div>
          <div className="detail-card">
            <div className="dl">Date</div>
            <div className="dv">{fmt(doc.created_at)}</div>
          </div>
          <div className="detail-card">
            <div className="dl">Department</div>
            <div className="dv">{doc.department?.name || '—'}</div>
          </div>
          <div className="detail-card">
            <div className="dl">Submitted By</div>
            <div className="dv">{doc.user?.name || '—'}</div>
          </div>
        </div>

        {doc.description && (
          <div className="detail-card">
            <div className="dl">Description</div>
            <div className="dv">{doc.description}</div>
          </div>
        )}

        {doc.remarks && (
          <div className="detail-card">
            <div className="dl">Reviewer Remarks</div>
            <div className="dv">{doc.remarks}</div>
          </div>
        )}

        {doc.reviewer && (
          <div className="detail-card">
            <div className="dl">Reviewed By</div>
            <div className="dv">{doc.reviewer.name}</div>
          </div>
        )}

        <div className="modal-footer">
          {doc.file_path && (
            <button
              className="btn btn-approve"
              onClick={() => downloadFile(doc.id, doc.file_name)}
            >
              ⬇ Download File
            </button>
          )}
          <button className="btn btn-view" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE: HOME
══════════════════════════════════════════════════════════ */
function PageHome({ docs, loading }) {
  const [selected, setSelected] = useState(null)

  const stats = {
    total:    docs.length,
    pending:  docs.filter(d => d.status === 'pending').length,
    approved: docs.filter(d => d.status === 'approved').length,
  }
  const recent = [...docs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-dot red" />
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">Total Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-dot yellow" />
          <div className="stat-num">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-dot green" />
          <div className="stat-num">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
      </div>

      <div className="section-title">Recent Documents</div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <div className="doc-list">
          {recent.length === 0 && (
            <div className="empty-state">
              <div className="es-icon">📭</div>No documents yet
            </div>
          )}
          {recent.map(doc => (
            <div
              key={doc.id}
              className="doc-item"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(doc)}
            >
              <div className="doc-accent" />
              <div className="doc-info">
                <div className="doc-name">{doc.title}</div>
                <div className="doc-meta">Uploaded {fmt(doc.created_at)}</div>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      )}

      {selected && <DocModal doc={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE: DOCUMENTS
══════════════════════════════════════════════════════════ */
function PageDocuments({ docs, loading, user, onRefresh }) {
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)
  const canReview = user?.role === 'admin' || user?.role === 'dept_head'

  const review = async (doc, status) => {
    const remarks =
      status === 'rejected'
        ? window.prompt(`Reason for rejecting "${doc.title}":`)
        : null
    if (status === 'rejected' && remarks === null) return
    try {
      await api.put(`/documents/${doc.id}/review`, { status, remarks })
      showToast(status === 'approved'
        ? `✅ "${doc.title}" approved!`
        : `❌ "${doc.title}" rejected.`)
      onRefresh()
    } catch {
      showToast('❌ Action failed.')
    }
  }

  return (
    <>
      <div className="filter-row">
        <h2>All Documents</h2>
        <select
          className="filter-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <div className="scroll-list">
          <div className="doc-list">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="es-icon">🔍</div>No documents found
              </div>
            )}
            {filtered.map(doc => (
              <div key={doc.id} className="doc-item">
                <div className="doc-accent" />
                <div className="doc-info">
                  <div className="doc-name">{doc.title}</div>
                  <div className="doc-meta">
                    {doc.department?.name} · {fmt(doc.created_at)}
                  </div>
                </div>
                <div className="doc-actions">
                  <StatusBadge status={doc.status} />

                  <button className="btn btn-view" onClick={() => setSelected(doc)}>
                    View
                  </button>

                  {/* Download only shown if file is attached */}
                  {doc.file_path && (
                    <button
                      className="btn btn-edit"
                      title="Download file"
                      onClick={() => downloadFile(doc.id, doc.file_name)}
                    >
                      ⬇
                    </button>
                  )}

                  {canReview && doc.status === 'pending' && (
                    <>
                      <button className="btn btn-approve" onClick={() => review(doc, 'approved')}>
                        Approve
                      </button>
                      <button className="btn btn-reject" onClick={() => review(doc, 'rejected')}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && <DocModal doc={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE: UPLOADS
══════════════════════════════════════════════════════════ */
function PageUploads({ departments, onSubmit }) {
  const [file, setFile]             = useState(null)
  const [title, setTitle]           = useState('')
  const [type, setType]             = useState('Report')
  const [deptId, setDeptId]         = useState('')
  const [notes, setNotes]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [drag, setDrag]             = useState(false)
  const inputRef                    = useRef()

  const DOC_TYPES = ['Report','Contract','Memo','Policy','Request','Proposal','Invoice','Other']
  const EXT_ICONS = { PDF:'📄', DOCX:'📝', DOC:'📝', XLSX:'📊', XLS:'📊', PNG:'🖼', JPG:'🖼', JPEG:'🖼' }

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 20 * 1024 * 1024) { showToast('❌ File too large! Max 20 MB'); return }
    const allowed = ['pdf','doc','docx','xls','xlsx','png','jpg','jpeg']
    const ext     = f.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) { showToast('❌ File type not allowed'); return }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { showToast('⚠ Please enter a document title'); return }
    if (!deptId)        { showToast('⚠ Please select a department'); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', title.trim())
      fd.append('department_id', deptId)
      if (notes.trim()) fd.append('description', notes.trim())
      if (file)         fd.append('file', file)

      await api.post('/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      showToast('✅ Document submitted successfully!')
      setFile(null); setTitle(''); setNotes(''); setDeptId(''); setType('Report')
      if (inputRef.current) inputRef.current.value = ''
      onSubmit()
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.'
      showToast(`❌ ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const ext = file ? file.name.split('.').pop().toUpperCase() : ''

  return (
    <form onSubmit={handleSubmit}>
      {file ? (
        <div className="file-preview">
          <span className="fp-icon">{EXT_ICONS[ext] || '📁'}</span>
          <span className="fp-name">
            {file.name}
            <span style={{ color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginLeft: 6 }}>
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </span>
          <button
            type="button"
            className="fp-remove"
            onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = '' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          className={`upload-zone${drag ? ' drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={e => handleFile(e.target.files[0])}
          />
          <div className="uz-plus">+</div>
          <p>Click to select a file</p>
          <small>PDF, DOCX, XLSX, PNG, JPG &nbsp;·&nbsp; Max 20 MB</small>
        </label>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Document Title:</label>
          <input
            type="text"
            placeholder="e.g. Q3 Report 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Type:</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-grid full">
        <div className="form-group">
          <label>Department:</label>
          <select value={deptId} onChange={e => setDeptId(e.target.value)} required>
            <option value="">— Select department —</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid full">
        <div className="form-group">
          <label>Notes (Optional):</label>
          <textarea
            placeholder="Add any relevant notes about this document..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Document'}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE: ACTIVITY LOGS
══════════════════════════════════════════════════════════ */
function PageActivity({ docs }) {
  const sorted = [...docs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <>
      <div className="section-title">Recent Activity</div>
      <div className="scroll-list">
        <div className="activity-list">
          {sorted.length === 0 && (
            <div className="empty-state">
              <div className="es-icon">📋</div>No activity yet
            </div>
          )}
          {sorted.map(doc => (
            <div key={doc.id} className="activity-item">
              <div className={`act-dot ${actDot(doc.status)}`} />
              <div>
                <div className="act-title">{doc.title}</div>
                <div className="act-time">
                  {doc.department?.name} · Uploaded {fmt(doc.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const [page, setPage]               = useState('home')
  const [docs, setDocs]               = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)

  const fetchDocs = () => {
    setLoading(true)
    api.get('/documents')
      .then(res => setDocs(res.data.data || res.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDocs()
    api.get('/departments').then(res => setDepartments(res.data)).catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'User'

  const NAV = [
    { id: 'home',      label: 'Home' },
    { id: 'documents', label: 'Documents' },
    { id: 'uploads',   label: 'Uploads' },
    { id: 'activity',  label: 'Activity Logs' },
  ]

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <PageHome docs={docs} loading={loading} />
      case 'documents':
        return <PageDocuments docs={docs} loading={loading} user={user} onRefresh={fetchDocs} />
      case 'uploads':
        return (
          <PageUploads
            departments={departments}
            onSubmit={() => { fetchDocs(); setPage('documents') }}
          />
        )
      case 'activity':
        return <PageActivity docs={docs} />
      default:
        return null
    }
  }

  return (
    <div className="app-shell">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-bar" />
          Document Tracker
        </div>
        <div className="topbar-right">
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700 }}>
            {user?.department?.name}
          </span>
          <div className="topbar-avatar" title={user?.name}>
            {firstName[0]}
          </div>
        </div>
      </div>

      <div className="main-layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-greeting">Hello,</div>
          <div className="sidebar-name">{firstName}!</div>
          <div className="sidebar-sep" />

          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-btn${page === item.id ? ' active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            className="nav-btn"
            onClick={logout}
            style={{
              background: 'var(--red-dark)',
              color: '#fff',
              marginTop: 8,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content-area">
          {renderPage()}
        </div>
      </div>

      {/* TOAST */}
      <div id="dt-toast" className="toast" style={{ display: 'none' }} />
    </div>
  )
}