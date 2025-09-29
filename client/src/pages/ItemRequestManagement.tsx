import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

const ItemRequestManagement = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [approvalDueDate, setApprovalDueDate] = useState('')
  const [approvalQuantity, setApprovalQuantity] = useState(1)
  
  // Dropdown expansion state
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsResponse = await apiFetch('/api/requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          // Filter only item requests
          const itemRequests = requestsData.filter((r: any) => r.request_type === 'item' || !r.request_type)
          setRequests(itemRequests)
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
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
      const requestsResponse = await apiFetch('/api/requests')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        const itemRequests = requestsData.filter((r: any) => r.request_type === 'item' || !r.request_type)
        setRequests(itemRequests)
      }
    } catch (error) {
      console.error('Error refreshing requests:', error)
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

  const openApprovalModal = (request: any) => {
    setSelectedRequest(request)
    setApprovalDueDate('')
    setApprovalQuantity(request.quantity_requested || 1)
    setShowApprovalModal(true)
  }

  const approveRequest = async () => {
    if (!selectedRequest) return
    try {
      const res = await apiFetch(`/api/requests/${selectedRequest.id}/approve-and-assign`, {
        method: 'POST',
        body: JSON.stringify({
          due_date: approvalDueDate,
          quantity: approvalQuantity
        })
      })
      if (res.ok) {
        await refreshRequests()
        alert('Request approved and assigned successfully!')
        setShowApprovalModal(false)
      } else {
        alert('Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error approving request')
    }
  }

  const deleteRequest = async (requestId: number) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      try {
        const response = await apiFetch(`/api/requests/${requestId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await refreshRequests()
          alert('Request deleted successfully!')
        } else {
          alert('Failed to delete request')
        }
      } catch (error) {
        console.error('Error deleting request:', error)
        alert('Error deleting request')
      }
    }
  }

  const pendingRequests = requests.filter((r: any) => String(r.status).toLowerCase() === 'pending')
  const approvedRequests = requests.filter((r: any) => 
    String(r.status).toLowerCase() === 'approved' || String(r.status).toLowerCase() === 'assigned'
  )
  const rejectedRequests = requests.filter((r: any) => String(r.status).toLowerCase() === 'rejected')

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
          searchPlaceholder="Search item requests..." 
          currentUser={currentUser}
        />
        
        <div className="dashboard-content">
          <div className="container-fluid py-4">
            {/* Request Status Cards */}
            <div className="request-status-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
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
                    <h3 className="mb-0">{pendingRequests.length}</h3>
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
                    <h6 className="text-success mb-1">Approved & Assigned</h6>
                    <h3 className="mb-0">{approvedRequests.length}</h3>
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
                    <h3 className="mb-0">{rejectedRequests.length}</h3>
                  </div>
                  <i className="bi bi-x-circle text-danger" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Item Requests</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Teacher</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request: any) => (
                        <React.Fragment key={request.id}>
                          <tr 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleRequestExpansion(request.id)}
                          >
                            <td>{request.id}</td>
                            <td>{request.teacher_name}</td>
                            <td>{request.item_name}</td>
                            <td>{request.quantity_requested}</td>
                            <td>
                              <span className={`badge ${
                                request.status === 'pending' ? 'bg-warning' :
                                request.status === 'approved' ? 'bg-success' :
                                request.status === 'rejected' ? 'bg-danger' :
                                request.status === 'assigned' ? 'bg-info' :
                                'bg-light text-dark'
                              }`}>
                                {request.status}
                              </span>
                            </td>
                            <td>{new Date(request.created_at).toLocaleDateString()}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="btn-group btn-group-sm">
                                {request.status === 'pending' && (
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openApprovalModal(request)}
                                    title="Approve Request"
                                  >
                                    <i className="bi bi-check"></i>
                                  </button>
                                )}
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteRequest(request.id)}
                                  title="Delete Request"
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
                                      <i className="bi bi-info-circle me-2"></i>Request Details
                                    </h6>
                                    <div className="detail-item">
                                      <strong>Request ID:</strong> {request.id}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Teacher:</strong> {request.teacher_name}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Item Name:</strong> {request.item_name}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Quantity Requested:</strong> {request.quantity_requested}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Quantity Assigned:</strong> {request.quantity_assigned || 'Not assigned'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Location:</strong> {request.location || 'Not specified'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Notes:</strong> {request.notes || 'No notes'}
                                    </div>
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
                                        request.status === 'assigned' ? 'bg-info' :
                                        'bg-light text-dark'
                                      }`}>
                                        {request.status}
                                      </span>
                                    </div>
                                    <div className="detail-item">
                                      <strong>Created:</strong> {new Date(request.created_at).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Due Date:</strong> {request.due_date ? new Date(request.due_date).toLocaleDateString() : 'Not set'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Assigned At:</strong> {request.assigned_at ? new Date(request.assigned_at).toLocaleString() : 'Not assigned'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Returned At:</strong> {request.returned_at ? new Date(request.returned_at).toLocaleString() : 'Not returned'}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Approve Request</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowApprovalModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Item:</strong> {selectedRequest.item_name}<br/>
                  <strong>Teacher:</strong> {selectedRequest.teacher_name}<br/>
                  <strong>Quantity Requested:</strong> {selectedRequest.quantity_requested}
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Due Date *</label>
                      <input
                        type="date"
                        value={approvalDueDate}
                        onChange={(e) => setApprovalDueDate(e.target.value)}
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Quantity to Assign *</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedRequest.quantity_requested}
                        value={approvalQuantity}
                        onChange={(e) => setApprovalQuantity(parseInt(e.target.value) || 1)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={approveRequest}
                  disabled={!approvalDueDate || approvalQuantity < 1}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Approve & Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemRequestManagement
