import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

const ReportManagement = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dropdown expansion state
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set())
  
  // Response modal state
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [responseStatus, setResponseStatus] = useState('under_review')
  const [adminResponse, setAdminResponse] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsResponse = await apiFetch('/api/reports')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setRequests(requestsData)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchRequests()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const refreshRequests = async () => {
    try {
      const requestsResponse = await apiFetch('/api/reports')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
      }
    } catch (error) {
      console.error('Error refreshing reports:', error)
    }
  }

  const toggleRequestExpansion = (requestId: number) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
  }

  const deleteRequest = async (requestId: number) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const response = await apiFetch(`/api/reports/${requestId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await refreshRequests()
          alert('Report deleted successfully!')
        } else {
          alert('Failed to delete report')
        }
      } catch (error) {
        console.error('Error deleting report:', error)
        alert('Error deleting report')
      }
    }
  }

  const openResponseModal = (report: any) => {
    setSelectedReport(report)
    setResponseStatus(report.status === 'pending' ? 'under_review' : report.status)
    setAdminResponse(report.admin_response || '')
    setShowResponseModal(true)
  }

  const closeResponseModal = () => {
    setShowResponseModal(false)
    setSelectedReport(null)
    setResponseStatus('under_review')
    setAdminResponse('')
  }

  const submitResponse = async () => {
    if (!selectedReport) return

    try {
      console.log('Submitting response:', {
        reportId: selectedReport.id,
        status: responseStatus,
        admin_response: adminResponse
      })

      const response = await apiFetch(`/api/reports/${selectedReport.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          status: responseStatus,
          admin_response: adminResponse
        })
      })

      console.log('Response result:', response.status, response.ok)

      if (response.ok) {
        await refreshRequests()
        closeResponseModal()
        alert('Response submitted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Failed to submit response: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Error submitting response')
    }
  }

  const pendingReports = requests.filter((r: any) => String(r.status).toLowerCase() === 'pending')
  const approvedReports = requests.filter((r: any) => String(r.status).toLowerCase() === 'approved')
  const rejectedReports = requests.filter((r: any) => String(r.status).toLowerCase() === 'rejected')
  const missingReports = requests.filter((r: any) => r.notes?.includes('MISSING'))
  const damagedReports = requests.filter((r: any) => r.notes?.includes('DAMAGED'))

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
        <AdminTopBar 
          searchPlaceholder="Search reports..." 
          currentUser={currentUser}
        />
        
        <div className="dashboard-content">
          <div className="container-fluid py-4">
            {/* Report Status Cards */}
            <div className="request-status-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px', 
              marginBottom: '20px' 
            }}>
              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #ffc107'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-warning mb-1">Pending</h6>
                    <h3 className="mb-0">{pendingReports.length}</h3>
                  </div>
                  <i className="bi bi-clock text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>

              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #28a745'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-success mb-1">Approved</h6>
                    <h3 className="mb-0">{approvedReports.length}</h3>
                  </div>
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                </div>
              </div>

              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #dc3545'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-danger mb-1">Rejected</h6>
                    <h3 className="mb-0">{rejectedReports.length}</h3>
                  </div>
                  <i className="bi bi-x-circle text-danger" style={{ fontSize: '24px' }}></i>
                </div>
              </div>

              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #dc3545'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-danger mb-1">Missing Items</h6>
                    <h3 className="mb-0">{missingReports.length}</h3>
                  </div>
                  <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '24px' }}></i>
                </div>
              </div>

              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #fd7e14'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-warning mb-1">Damaged Items</h6>
                    <h3 className="mb-0">{damagedReports.length}</h3>
                  </div>
                  <i className="bi bi-tools text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Issue Reports</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Teacher</th>
                        <th>Item</th>
                        <th>Issue Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request: any) => {
                        // Extract item name and quantity from description (format: "Item Name (Qty: X) - Description" or "Item Name (Qty: X)")
                        const itemMatch = request.description?.match(/^(.+?)\s*\(Qty:\s*(\d+)\)(?:\s*-\s*(.+))?$/)
                        const itemName = itemMatch ? itemMatch[1] : (request.description?.split(' - ')[0] || 'Unknown Item')
                        const quantity = itemMatch ? itemMatch[2] : '1'
                        
                        return (
                          <React.Fragment key={request.id}>
                            <tr 
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleRequestExpansion(request.id)}
                            >
                              <td>{request.id}</td>
                              <td>{request.teacher_name}</td>
                              <td>
                                <span className="badge bg-info text-dark">
                                  {itemName}
                                </span>
                                <br />
                                <small className="text-muted">Qty: {quantity}</small>
                              </td>
                              <td>
                                <span className={`badge ${
                                  request.notes?.includes('MISSING') ? 'bg-danger' :
                                  request.notes?.includes('DAMAGED') ? 'bg-warning' :
                                  'bg-secondary'
                                }`}>
                                  {request.notes?.includes('MISSING') ? 'Missing' :
                                   request.notes?.includes('DAMAGED') ? 'Damaged' : 'Other'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  request.status === 'pending' ? 'bg-warning' :
                                  request.status === 'under_review' ? 'bg-info' :
                                  request.status === 'in_progress' ? 'bg-primary' :
                                  request.status === 'resolved' ? 'bg-success' :
                                  request.status === 'rejected' ? 'bg-danger' :
                                  'bg-light text-dark'
                                }`}>
                                  {request.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td>{new Date(request.created_at).toLocaleDateString()}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => openResponseModal(request)}
                                  title="Respond to Report"
                                >
                                  <i className="bi bi-chat-dots"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteRequest(request.id)}
                                  title="Delete Report"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRequests.has(request.id) && (
                            <tr>
                              <td colSpan={7}>
                                <div className="request-details-grid" style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                  gap: '20px',
                                  padding: '20px',
                                  backgroundColor: '#f8f9fa',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '8px',
                                  margin: '10px 0'
                                }}>
                                  <div className="detail-section">
                                    <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>
                                      <i className="bi bi-info-circle me-2"></i>Report Details
                                    </h6>
                                    <div className="detail-item">
                                      <strong>Report ID:</strong> {request.id}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Teacher:</strong> {request.teacher_name}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Item Name:</strong> {itemName}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Quantity:</strong> {quantity}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Location:</strong> {request.location || 'Not specified'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Subject:</strong> {request.subject || 'Not specified'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Description:</strong> {request.description || 'No description'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Notes:</strong> {request.notes || 'No notes'}
                                    </div>
                                    {request.admin_response && (
                                      <div className="detail-item">
                                        <strong>Admin Response:</strong> 
                                        <div className="alert alert-info mt-2 mb-0">
                                          {request.admin_response}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="detail-section">
                                    <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                                      <i className="bi bi-calendar-check me-2"></i>Status & Timeline
                                    </h6>
                                    <div className="detail-item">
                                      <strong>Status:</strong> 
                                      <span className={`badge ms-2 ${
                                        request.status === 'pending' ? 'bg-warning' :
                                        request.status === 'approved' ? 'bg-success' :
                                        request.status === 'rejected' ? 'bg-danger' :
                                        'bg-light text-dark'
                                      }`}>
                                        {request.status}
                                      </span>
                                    </div>
                                    <div className="detail-item">
                                      <strong>Created:</strong> {new Date(request.created_at).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Last Updated:</strong> {new Date(request.updated_at).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-dots me-2"></i>
                  Respond to Report #{selectedReport?.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeResponseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Report Details</h6>
                    <p><strong>Teacher:</strong> {selectedReport?.teacher_name}</p>
                    <p><strong>Item:</strong> {selectedReport?.description?.split(' - ')[0] || 'Unknown Item'}</p>
                    <p><strong>Location:</strong> {selectedReport?.location}</p>
                    <p><strong>Current Status:</strong> 
                      <span className={`badge ms-2 ${
                        selectedReport?.status === 'pending' ? 'bg-warning' :
                        selectedReport?.status === 'under_review' ? 'bg-info' :
                        selectedReport?.status === 'in_progress' ? 'bg-primary' :
                        selectedReport?.status === 'resolved' ? 'bg-success' :
                        selectedReport?.status === 'rejected' ? 'bg-danger' :
                        'bg-light text-dark'
                      }`}>
                        {selectedReport?.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Response</h6>
                    <div className="mb-3">
                      <label className="form-label">Update Status</label>
                      <select 
                        className="form-select"
                        value={responseStatus}
                        onChange={(e) => setResponseStatus(e.target.value)}
                      >
                        <option value="under_review">Under Review</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Admin Response</label>
                      <textarea 
                        className="form-control"
                        rows={4}
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Enter your response to the teacher..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeResponseModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reject this report? This action will mark the report as rejected.')) {
                      setResponseStatus('rejected')
                      submitResponse()
                    }
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Reject Report
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={submitResponse}
                >
                  <i className="bi bi-send me-1"></i>
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportManagement
