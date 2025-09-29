import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'

export default function Dashboard() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [sample, setSample] = useState<any>(null)
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    pendingRequests: 0,
    totalUsers: 0,
    availableItems: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setApiStatus(`${data.status} @ ${data.timestamp}`))
      .catch(() => setApiStatus('offline'))

    fetch('/api/sample')
      .then((r) => r.json())
      .then((data) => setSample(data))
      .catch(() => setSample({ message: 'offline' }))
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return
      
      try {
        setLoading(true)
        
        // Fetch data in parallel
        const [inventoryRes, requestsRes, usersRes, reportsRes] = await Promise.all([
          apiFetch('/api/inventory'),
          apiFetch('/api/requests'),
          apiFetch('/api/users'),
          apiFetch('/api/reports')
        ])

        const inventory = inventoryRes.ok ? await inventoryRes.json() : []
        const requests = requestsRes.ok ? await requestsRes.json() : []
        const users = usersRes.ok ? await usersRes.json() : []
        const reports = reportsRes.ok ? await reportsRes.json() : []

        // Calculate totals
        const totalItems = inventory.length
        const availableItems = inventory.reduce((sum: number, item: any) => sum + (item.available || 0), 0)
        const pendingRequests = requests.filter((req: any) => 
          req.status === 'pending' || req.status === 'under_review'
        ).length
        const totalUsers = users.length

        // Get recent activity (last 10 items)
        const recentActivity = [
          ...requests.slice(0, 5).map((req: any) => ({
            type: 'request',
            icon: 'bi-file-earmark-text',
            color: '#3182ce',
            text: `New ${req.request_type || 'item'} request from ${req.teacher_name}`,
            time: new Date(req.created_at).toLocaleString()
          })),
          ...reports.slice(0, 3).map((report: any) => ({
            type: 'report',
            icon: 'bi-exclamation-triangle',
            color: '#e53e3e',
            text: `New report: ${report.notes?.includes('MISSING') ? 'Missing' : report.notes?.includes('DAMAGED') ? 'Damaged' : 'Other'} item`,
            time: new Date(report.created_at).toLocaleString()
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

        setDashboardData({
          totalItems,
          pendingRequests,
          totalUsers,
          availableItems,
          recentActivity
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchDashboardData()
    }
  }, [currentUser])

  return (
    <div className="dashboard-container">
      <Sidebar currentUser={currentUser} />
      
      <main className="main-content">
        {currentUser?.role === 'ADMIN' ? (
          <AdminTopBar 
            searchPlaceholder="Search dashboard..." 
            currentUser={currentUser}
          />
        ) : (
          <TeacherTopBar 
            searchPlaceholder="Search dashboard..." 
            currentUser={currentUser}
          />
        )}
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {currentUser?.name}! Here's what's happening with your inventory system.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="standard-card">
              <div className="standard-card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="standard-card-title">
                      <i className="bi bi-box"></i>
                      Total Items
                    </h3>
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                      {loading ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        dashboardData.totalItems.toLocaleString()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="standard-card">
              <div className="standard-card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="standard-card-title">
                      <i className="bi bi-file-earmark-text"></i>
                      Pending Requests
                    </h3>
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-pending)' }}>
                      {loading ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        dashboardData.pendingRequests.toLocaleString()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="standard-card">
              <div className="standard-card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="standard-card-title">
                      <i className="bi bi-people"></i>
                      Users
                    </h3>
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-assigned)' }}>
                      {loading ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        dashboardData.totalUsers.toLocaleString()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="standard-card">
              <div className="standard-card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="standard-card-title">
                      <i className="bi bi-check-circle"></i>
                      Available Items
                    </h3>
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--status-approved)' }}>
                      {loading ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        dashboardData.availableItems.toLocaleString()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Recent Activity */}
            <div className="standard-card">
              <div className="standard-card-header">
                <h3 className="standard-card-title">
                  <i className="bi bi-clock-history"></i>
                  Recent Activity
                </h3>
              </div>
              <div className="standard-card-body">
                {loading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p className="mt-2">Loading activity...</p>
                  </div>
                ) : dashboardData.recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {dashboardData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="activity-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) 0',
                        borderBottom: index < dashboardData.recentActivity.length - 1 ? '1px solid var(--gray-200)' : 'none'
                      }}>
                        <i className={`bi ${activity.icon}`} style={{ 
                          color: activity.color, 
                          fontSize: '1.25rem',
                          width: '20px',
                          textAlign: 'center'
                        }}></i>
                        <div style={{ flex: 1 }}>
                          <div className="activity-text" style={{ 
                            fontWeight: '500', 
                            color: 'var(--text-dark)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {activity.text}
                          </div>
                          <div className="activity-time" style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--gray-500)' 
                          }}>
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="empty-state-title">No recent activity</div>
                    <div className="empty-state-description">Activity will appear here as users interact with the system</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="standard-card">
              <div className="standard-card-header">
                <h3 className="standard-card-title">
                  <i className="bi bi-lightning"></i>
                  Quick Actions
                </h3>
              </div>
              <div className="standard-card-body">
                <div className="quick-actions-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-4)'
                }}>
                  {currentUser?.role === 'ADMIN' ? (
                    <>
                      <button 
                        className="btn-standard btn-primary"
                        onClick={() => navigate('/inventory')}
                      >
                        <i className="bi bi-plus"></i> Add Item
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/manage-requests/item')}
                      >
                        <i className="bi bi-file-earmark-text"></i> Manage Requests
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/reports')}
                      >
                        <i className="bi bi-file-earmark-bar-graph"></i> Generate Report
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/user-management')}
                      >
                        <i className="bi bi-people"></i> Manage Users
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-standard btn-primary"
                        onClick={() => navigate('/item-request')}
                      >
                        <i className="bi bi-file-earmark-text"></i> Request Item
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/custom-request')}
                      >
                        <i className="bi bi-plus-circle"></i> Custom Request
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/report-issue')}
                      >
                        <i className="bi bi-exclamation-triangle"></i> Report Issue
                      </button>
                      <button 
                        className="btn-standard btn-outline-primary"
                        onClick={() => navigate('/assigned-items')}
                      >
                        <i className="bi bi-box"></i> My Items
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="standard-card">
            <div className="standard-card-header">
              <h3 className="standard-card-title">
                <i className="bi bi-graph-up"></i>
                System Overview
              </h3>
            </div>
            <div className="standard-card-body">
              <div className="system-stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-6)',
                textAlign: 'center'
              }}>
                <div className="stat-item">
                  <div className="stat-icon" style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📊</div>
                  <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>API Status</div>
                  <div className="stat-value" style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: apiStatus === 'offline' ? 'var(--danger-red)' : 'var(--status-approved)' 
                  }}>
                    {apiStatus}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon" style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📈</div>
                  <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>Total Requests</div>
                  <div className="stat-value" style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--primary-blue)' }}>
                    {dashboardData.pendingRequests + (dashboardData.totalItems - dashboardData.availableItems)}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon" style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>✅</div>
                  <div className="stat-label" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-1)' }}>System Health</div>
                  <div className="stat-value" style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--status-approved)' }}>
                    Good
                  </div>
                </div>
              </div>
              <div className="time-filters" style={{
                display: 'flex',
                gap: 'var(--space-2)',
                justifyContent: 'center',
                marginTop: 'var(--space-6)'
              }}>
                <button className="btn-standard btn-sm btn-primary">Today</button>
                <button className="btn-standard btn-sm btn-outline-secondary">This Week</button>
                <button className="btn-standard btn-sm btn-outline-secondary">This Month</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
