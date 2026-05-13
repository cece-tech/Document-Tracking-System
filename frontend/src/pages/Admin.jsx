import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../app.css'
import api from '../api/axios'

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [documents, setDocuments] = useState([])
  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState('documents')

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [loading, setLoading] = useState(false)
  const [deptFilter, setDeptFilter] = useState(null)

  // Counts
  const departmentCounts = users.reduce((acc, u) => {
    const dept = u.department?.name || '—'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const totalUsers = users.length

  const statusCounts = documents.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {})

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard')
    setLoading(true)
    Promise.all([
      api.get('/users'),
      api.get('/documents')
    ]).then(([usersRes, docsRes]) => {
      setUsers(usersRes.data)
      setDocuments(docsRes.data.data)
    }).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (tab === 'logs') {
      setLoading(true)
      api.get('/document-logs')
        .then(res => setLogs(res.data.data))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const changeRole = async (userId, role) => {
    await api.put(`/users/${userId}`, { role })
    const res = await api.get('/users')
    setUsers(res.data)
  }

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete this document?')) return
    await api.delete(`/documents/${id}`)
    setDocuments(documents.filter(d => d.id !== id))
  }

  const filteredUsers = users
    .filter(u =>
      (deptFilter ? u.department?.name === deptFilter : true) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let valA = sortKey === 'department' ? (a.department?.name || '') : (a[sortKey] || '')
      let valB = sortKey === 'department' ? (b.department?.name || '') : (b[sortKey] || '')
      const comparison = valA.localeCompare(valB)
      return sortOrder === 'asc' ? comparison : -comparison
    })

  return (
    <div className="app-shell">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-bar"></div>
          Admin Panel
        </div>
        <div className="topbar-right">
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-greeting">Hello,</div>
          <div className="sidebar-name">{user?.name}</div>
          <div className="sidebar-sep"></div>
          <button className={`nav-btn ${tab === 'documents' ? 'active' : ''}`} onClick={() => setTab('documents')}>Documents</button>
          <button className={`nav-btn ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>Audit Logs</button>
          <button className={`nav-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
        </div>

        {/* Content */}
        <div className="content-area">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && tab === 'documents' && (
            <>
              <h2 className="section-title">Documents</h2>
              <div className="stats-row">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="stat-card">
                    <div className="stat-num">{count}</div>
                    <div className="stat-label">{status}</div>
                  </div>
                ))}
              </div>
              <table className="doc-table">
                <thead>
                  <tr>
                    {['Title', 'Department', 'User', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.title}</td>
                      <td>{doc.department?.name}</td>
                      <td>{doc.user?.name}</td>
                      <td><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                      <td><button className="btn btn-danger" onClick={() => deleteDoc(doc.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {!loading && tab === 'logs' && (
            <>
              <h2 className="section-title">Audit Logs</h2>
              <table className="doc-table">
                <thead>
                  <tr>
                    {['Document', 'Action', 'User', 'Remarks', 'Date'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.document?.title}</td>
                      <td>{log.action}</td>
                      <td>{log.user?.name}</td>
                      <td>{log.notes || '—'}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {!loading && tab === 'users' && (
            <>
              <h2 className="section-title">Users</h2>
              <div className="stats-row">
                {Object.entries(departmentCounts).map(([dept, count]) => (
                  <button
                    key={dept}
                    className="stat-card"
                    onClick={() => setDeptFilter(deptFilter === dept ? null : dept)}
                  >
                    <div className="stat-num">{count}</div>
                    <div className="stat-label">{dept}</div>
                  </button>
                ))}
                <div className="stat-card">
                  <div className="stat-num">{totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="filter-row">
                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-group input"
                />
                <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="filter-select">
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="department">Department</option>
                </select>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="filter-select">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <table className="doc-table">
                <thead>
                  <tr>
                    {['Name', 'Email', 'Department', 'Role', 'Change Role'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.department?.name || '—'}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          className="form-group select"
                        >
                          <option value="staff">staff</option>
                          <option value="dept_head">dept_head</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}