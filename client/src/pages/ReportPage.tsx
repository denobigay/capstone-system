import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'
import ReportForm from '../components/ReportForm'

const ReportPage = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsResponse = await apiFetch('/api/reports')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setRequests(reportsData)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchReports()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchReports, 30000)
      
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const refreshRequests = async () => {
    try {
      const reportsResponse = await apiFetch('/api/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setRequests(reportsData)
      }
    } catch (error) {
      console.error('Error refreshing reports:', error)
    }
  }

  // Admin View - Manage Reports
  const AdminView = () => {
    const reports = requests // All reports are already filtered by the API
    
    console.log('AdminView - requests state:', requests)
    console.log('AdminView - reports length:', reports.length)
    
    return (
      <>
        <div className="request-status-card" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Issue Reports Management
          </h4>
          
          <div className="mb-3">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={async () => {
                console.log('Manual fetch test...')
                try {
                  const response = await apiFetch('/api/reports')
                  console.log('Manual fetch response:', response)
                  const data = await response.json()
                  console.log('Manual fetch data:', data)
                  setRequests(data)
                } catch (error) {
                  console.error('Manual fetch error:', error)
                }
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Test Fetch Reports
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No reports found. Reports will appear here when teachers submit them.
            </div>
          ) : (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>
              Found {reports.length} report(s)
            </div>
          )}
          
          {reports.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Teacher</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: any) => {
                    // Extract item name and quantity from description (format: "Item Name (Qty: X) - Description" or "Item Name (Qty: X)")
                    const itemMatch = report.description?.match(/^(.+?)\s*\(Qty:\s*(\d+)\)(?:\s*-\s*(.+))?$/)
                    const itemName = itemMatch ? itemMatch[1] : (report.description?.split(' - ')[0] || 'Unknown Item')
                    const quantity = itemMatch ? itemMatch[2] : '1'
                    return (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>{report.teacher_name}</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {itemName}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {quantity}
                          </span>
                        </td>
                        <td>{report.location}</td>
                      <td>
                        <span className={`badge ${
                          report.status === 'pending' ? 'bg-warning' :
                          report.status === 'under_review' ? 'bg-info' :
                          report.status === 'in_progress' ? 'bg-primary' :
                          report.status === 'resolved' ? 'bg-success' :
                          report.status === 'rejected' ? 'bg-danger' :
                          'bg-light text-dark'
                        }`}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(report.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {report.status === 'pending' && (
                              <button className="btn btn-outline-info btn-sm">
                                <i className="bi bi-chat-dots"></i>
                              </button>
                            )}
                            <button className="btn btn-outline-danger btn-sm">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report History */}
        <div className="request-status-card" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="bi bi-clock-history me-2"></i>
            Report History
          </h4>
          
          <div className="row">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Missing Items
                  </h6>
                </div>
                <div className="card-body">
                  <h4 className="text-danger">
                    {reports.filter(r => r.status === 'pending').length}
                  </h4>
                  <p className="text-muted mb-0">Pending reports</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-warning">
                <div className="card-header bg-warning text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Resolved Reports
                  </h6>
                </div>
                <div className="card-body">
                  <h4 className="text-success">
                    {reports.filter(r => r.status === 'resolved').length}
                  </h4>
                  <p className="text-muted mb-0">Resolved reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Teacher View - Submit Reports
  const TeacherView = () => {
    const myReports = requests.filter((r: any) => 
      String(r.teacher_name).toLowerCase() === String(currentUser.name).toLowerCase()
    )
    
    return (
      <>
        <div className="request-status-card" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Report Item Issues
          </h4>
          <p className="text-muted">Report missing or damaged items that are assigned to you</p>
        </div>

        <ReportForm currentUser={currentUser} onRequestSubmit={refreshRequests} />

        {/* My Reports History */}
        {myReports.length > 0 && (
          <div className="request-status-card" style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ marginBottom: 0, color: '#1e40af' }}>
                <i className="bi bi-clock-history me-2"></i>
                My Issue Reports
              </h4>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={refreshRequests}
                title="Refresh Reports"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            
            {/* Status Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-2 col-6 mb-2">
                <div className="card border-warning">
                  <div className="card-body text-center p-2">
                    <h6 className="text-warning mb-1">PENDING</h6>
                    <h4 className="mb-0">{myReports.filter((r: any) => r.status === 'pending').length}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-2">
                <div className="card border-info">
                  <div className="card-body text-center p-2">
                    <h6 className="text-info mb-1">UNDER REVIEW</h6>
                    <h4 className="mb-0">{myReports.filter((r: any) => r.status === 'under_review').length}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-2">
                <div className="card border-primary">
                  <div className="card-body text-center p-2">
                    <h6 className="text-primary mb-1">IN PROGRESS</h6>
                    <h4 className="mb-0">{myReports.filter((r: any) => r.status === 'in_progress').length}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-2">
                <div className="card border-success">
                  <div className="card-body text-center p-2">
                    <h6 className="text-success mb-1">RESOLVED</h6>
                    <h4 className="mb-0">{myReports.filter((r: any) => r.status === 'resolved').length}</h4>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-2">
                <div className="card border-danger">
                  <div className="card-body text-center p-2">
                    <h6 className="text-danger mb-1">REJECTED</h6>
                    <h4 className="mb-0">{myReports.filter((r: any) => r.status === 'rejected').length}</h4>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Admin Response</th>
                    <th>Report Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map((report: any) => {
                    // Extract item name and quantity from description (format: "Item Name (Qty: X) - Description" or "Item Name (Qty: X)")
                    const itemMatch = report.description?.match(/^(.+?)\s*\(Qty:\s*(\d+)\)(?:\s*-\s*(.+))?$/)
                    const itemName = itemMatch ? itemMatch[1] : (report.description?.split(' - ')[0] || 'Unknown Item')
                    const quantity = itemMatch ? itemMatch[2] : '1'
                    const description = itemMatch ? (itemMatch[3] || 'No description provided') : (report.description?.split(' - ').slice(1).join(' - ') || 'No description provided')
                    return (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {itemName}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {quantity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            report.status === 'pending' ? 'bg-warning' :
                            report.status === 'under_review' ? 'bg-info' :
                            report.status === 'in_progress' ? 'bg-primary' :
                            report.status === 'resolved' ? 'bg-success' :
                            report.status === 'rejected' ? 'bg-danger' :
                            'bg-light text-dark'
                          }`}>
                            {report.status === 'pending' && <i className="bi bi-clock me-1"></i>}
                            {report.status === 'under_review' && <i className="bi bi-eye me-1"></i>}
                            {report.status === 'in_progress' && <i className="bi bi-gear me-1"></i>}
                            {report.status === 'resolved' && <i className="bi bi-check-circle me-1"></i>}
                            {report.status === 'rejected' && <i className="bi bi-x-circle me-1"></i>}
                            {report.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {report.admin_response ? (
                            <div className="alert alert-info p-2 mb-0" style={{ fontSize: '0.8rem' }}>
                              {report.admin_response}
                            </div>
                          ) : (
                            <span className="text-muted">No response yet</span>
                          )}
                        </td>
                        <td>{new Date(report.created_at).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Access Denied</h4>
        <p>You must be logged in to access this page.</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar currentUser={currentUser} />
      
      <main className="main-content">
        {currentUser.role === 'ADMIN' ? <AdminTopBar /> : <TeacherTopBar />}
        
        <div className="dashboard-content">
          <div className="container-fluid py-4">
            {currentUser.role === 'ADMIN' ? <AdminView /> : <TeacherView />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReportPage
