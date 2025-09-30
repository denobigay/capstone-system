import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'

interface SidebarProps {
  currentUser?: {
    name: string
    role: string
  }
}

export default function Sidebar({ currentUser }: SidebarProps) {
  const { user, logout } = useAuth()
  const role = user?.role || currentUser?.role || 'ADMIN'
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsManageDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/uploads/Logo.png" alt="Lawaan Integrated School" />
        </div>
        <div className="sidebar-title">
          <h2>Property Management</h2>
          <h3>Inventory System</h3>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-graph-up"></i>
          Dashboard
        </NavLink>
        {role === 'ADMIN' && (
        <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-box"></i>
          Inventory
        </NavLink>
        )}
        <NavLink to="/assigned-items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-box-seam"></i>
          Assigned Items
        </NavLink>
        {role === 'TEACHER' && (
          <>
            <NavLink to="/send-request/item" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-box-seam"></i>
              Item Request
            </NavLink>
            <NavLink to="/send-request/custom" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-sliders"></i>
              Custom Request
            </NavLink>
            <NavLink to="/send-request/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-exclamation-triangle"></i>
              Report Issue
            </NavLink>
          </>
        )}
        {role === 'ADMIN' && (
          <div className="nav-dropdown" ref={dropdownRef}>
            <button 
              className={`nav-link ${isManageDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsManageDropdownOpen(!isManageDropdownOpen)}
            >
              <i className="bi bi-file-earmark-text"></i>
              Manage Requests
              <i className={`bi bi-chevron-${isManageDropdownOpen ? 'up' : 'down'} ms-auto`} style={{ fontSize: '12px' }}></i>
            </button>
            {isManageDropdownOpen && (
              <div className="dropdown-menu">
                <NavLink 
                  to="/manage-requests/item" 
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsManageDropdownOpen(false)}
                >
                  <i className="bi bi-box-seam me-2"></i>
                  Item Requests
                </NavLink>
                <NavLink 
                  to="/manage-requests/custom" 
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsManageDropdownOpen(false)}
                >
                  <i className="bi bi-sliders me-2"></i>
                  Custom Requests
                </NavLink>
                <NavLink 
                  to="/manage-requests/report" 
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsManageDropdownOpen(false)}
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Reports
                </NavLink>
              </div>
            )}
          </div>
        )}
        {role === 'ADMIN' && (
        <NavLink to="/qr-generator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-qr-code"></i>
          QR Generator
        </NavLink>
        )}
        {role === 'ADMIN' && (
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people"></i>
          Users
        </NavLink>
        )}
        {role === 'ADMIN' && (
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bar-chart"></i>
          Reports
        </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-gear"></i>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <i className="bi bi-person-circle"></i>
          <div>
            <div>{user?.name || currentUser?.name || 'User'}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </aside>
  )
}
