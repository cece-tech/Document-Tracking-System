import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../app.css'
import api from '../api/axios'

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [users, setUsers]       = useState([])
  const [documents, setDocuments] = useState([])
  const [tab, setTab] = useState('documents')

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard')
    api.get('/users').then(res => setUsers(res.data))
    api.get('/documents').then(res => setDocuments(res.data.data))
  }, [user])

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
          <button
            className={`nav-btn ${tab === 'documents' ? 'active' : ''}`}
            onClick={() => setTab('documents')}
          >
            Documents
          </button>
          <button
            className={`nav-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
        </div>

        {/* Content */}
        <div className="content-area">
          {tab === 'documents' && (
            <>
              <h2 className="section-title">Documents</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Title', 'Department', 'User', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td style={{ padding: '12px 16px' }}>{doc.title}</td>
                      <td style={{ padding: '12px 16px' }}>{doc.department?.name}</td>
                      <td style={{ padding: '12px 16px' }}>{doc.user?.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge badge-${doc.status}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-danger" onClick={() => deleteDoc(doc.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === 'users' && (
            <>
              <h2 className="section-title">Users</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Department', 'Role', 'Change Role'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: '12px 16px' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>{u.department?.name || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
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
