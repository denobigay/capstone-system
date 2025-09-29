import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

const CustomRequestManagement = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Custom request response modal state
  const [showCustomResponseModal, setShowCustomResponseModal] = useState(false)
  const [customResponse, setCustomResponse] = useState('')
  const [customResponseStatus, setCustomResponseStatus] = useState('under_review')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  
  // Purchasing update modal state
  const [showPurchasingUpdateModal, setShowPurchasingUpdateModal] = useState(false)
  const [purchasingUpdateStatus, setPurchasingUpdateStatus] = useState('approved')
  const [purchasingUpdateResponse, setPurchasingUpdateResponse] = useState('')
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)
  const [quantityAssigned, setQuantityAssigned] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  
  // Dropdown expansion state
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsResponse = await apiFetch('/api/custom-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setRequests(requestsData)
        }
      } catch (error) {
        console.error('Error fetching custom requests:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchInventoryItems = async () => {
      try {
        const inventoryResponse = await apiFetch('/api/inventory')
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          setInventoryItems(inventoryData)
        }
      } catch (error) {
        console.error('Error fetching inventory items:', error)
      }
    }

    if (currentUser) {
      fetchRequests()
      fetchInventoryItems()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const refreshRequests = async () => {
    try {
      const requestsResponse = await apiFetch('/api/custom-requests')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
      }
    } catch (error) {
      console.error('Error refreshing custom requests:', error)
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

  const openCustomResponseModal = (request: any) => {
    setSelectedRequest(request)
    setCustomResponse('')
    setCustomResponseStatus('under_review')
    setShowCustomResponseModal(true)
  }

  const respondToCustomRequest = async () => {
    if (!selectedRequest) return
    try {
      const res = await apiFetch(`/api/custom-requests/${selectedRequest.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          status: customResponseStatus,
          admin_response: customResponse
        })
      })
      if (res.ok) {
        await refreshRequests()
        alert('Response sent successfully!')
        setShowCustomResponseModal(false)
      } else {
        alert('Failed to send response')
      }
    } catch (error) {
      console.error('Error sending response:', error)
      alert('Error sending response')
    }
  }

  const openPurchasingUpdateModal = (request: any) => {
    setSelectedRequest(request)
    setPurchasingUpdateStatus('approved')
    setPurchasingUpdateResponse('')
    setSelectedInventoryItem(null)
    setQuantityAssigned(request.quantity_requested)
    setDueDate('')
    setShowPurchasingUpdateModal(true)
  }

  const updatePurchasingRequest = async () => {
    if (!selectedRequest) return
    try {
      const res = await apiFetch(`/api/custom-requests/${selectedRequest.id}/update-purchasing`, {
        method: 'POST',
        body: JSON.stringify({
          status: purchasingUpdateStatus,
          admin_response: purchasingUpdateResponse,
          item_id: selectedInventoryItem?.id || null,
          quantity_assigned: quantityAssigned,
          due_date: dueDate
        })
      })
      if (res.ok) {
        await refreshRequests()
        alert('Request updated successfully!')
        setShowPurchasingUpdateModal(false)
      } else {
        alert('Failed to update request')
      }
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request')
    }
  }

  const deleteRequest = async (requestId: number) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      try {
        const response = await apiFetch(`/api/custom-requests/${requestId}`, {
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
  const underReviewRequests = requests.filter((r: any) => String(r.status).toLowerCase() === 'under_review')
  const purchasingRequests = requests.filter((r: any) => String(r.status).toLowerCase() === 'purchasing')
  const approvedRequests = requests.filter((r: any) => String(r.status).toLowerCase() === 'approved')
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
          searchPlaceholder="Search custom requests..." 
          currentUser={currentUser}
        />
        
        <div className="dashboard-content">
          <div className="container-fluid py-4">
            {/* Request Status Cards */}
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
                borderLeft: '4px solid #17a2b8'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-info mb-1">Under Review</h6>
                    <h3 className="mb-0">{underReviewRequests.length}</h3>
                  </div>
                  <i className="bi bi-search text-info" style={{ fontSize: '24px' }}></i>
                </div>
              </div>

              <div className="request-status-card" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #6f42c1'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-primary mb-1">Purchasing</h6>
                    <h3 className="mb-0">{purchasingRequests.length}</h3>
                  </div>
                  <i className="bi bi-cart text-primary" style={{ fontSize: '24px' }}></i>
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
                <h5 className="mb-0">Custom Requests</h5>
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
                                request.status === 'under_review' ? 'bg-info' :
                                request.status === 'purchasing' ? 'bg-primary' :
                                request.status === 'approved' ? 'bg-success' :
                                request.status === 'rejected' ? 'bg-danger' :
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
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => openCustomResponseModal(request)}
                                    title="Respond to Custom Request"
                                  >
                                    <i className="bi bi-chat-dots"></i>
                                  </button>
                                )}
                                {request.status === 'purchasing' && (
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openPurchasingUpdateModal(request)}
                                    title="Update Purchasing Request"
                                  >
                                    <i className="bi bi-check-circle"></i>
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
                                      <strong>Location:</strong> {request.location || 'Not specified'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Subject:</strong> {request.subject || 'Not specified'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Description:</strong> {request.description || 'No description'}
                                    </div>
                                    <div className="detail-item">
                                      <strong>Admin Response:</strong> {request.admin_response || 'No response yet'}
                                    </div>
                                    {request.photo && (
                                      <div className="detail-item">
                                        <strong>Item Photo:</strong>
                                        <div className="mt-2">
                                          <img 
                                            src={request.photo} 
                                            alt="Item photo" 
                                            style={{ 
                                              maxWidth: '200px', 
                                              maxHeight: '200px', 
                                              objectFit: 'cover',
                                              borderRadius: '8px',
                                              border: '1px solid #dee2e6'
                                            }} 
                                          />
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
                                        request.status === 'under_review' ? 'bg-info' :
                                        request.status === 'purchasing' ? 'bg-primary' :
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Response Modal */}
      {showCustomResponseModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Respond to Custom Request</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCustomResponseModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Item:</strong> {selectedRequest.item_name}<br/>
                  <strong>Teacher:</strong> {selectedRequest.teacher_name}<br/>
                  <strong>Quantity:</strong> {selectedRequest.quantity_requested}<br/>
                  <strong>Description:</strong> {selectedRequest.description || 'N/A'}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Response Status *</label>
                  <select 
                    className="form-select"
                    value={customResponseStatus}
                    onChange={(e) => setCustomResponseStatus(e.target.value)}
                  >
                    <option value="under_review">Under Review</option>
                    <option value="purchasing">Being Purchased</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Admin Response</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={customResponse}
                    onChange={(e) => setCustomResponse(e.target.value)}
                    placeholder="Add your response to the teacher..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCustomResponseModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={respondToCustomRequest}
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchasing Update Modal */}
      {showPurchasingUpdateModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Purchasing Request</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPurchasingUpdateModal(false)}
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
                      <label className="form-label">Update Status *</label>
                      <select 
                        className="form-select"
                        value={purchasingUpdateStatus}
                        onChange={(e) => setPurchasingUpdateStatus(e.target.value)}
                      >
                        <option value="approved">Approved & Assign Item</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Due Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {purchasingUpdateStatus === 'approved' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Select Inventory Item *</label>
                      <select 
                        className="form-select"
                        value={selectedInventoryItem?.id || ''}
                        onChange={(e) => {
                          const item = inventoryItems.find(i => i.id === parseInt(e.target.value))
                          setSelectedInventoryItem(item)
                        }}
                      >
                        <option value="">Select an item from inventory</option>
                        {inventoryItems.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name} (Available: {item.available})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Quantity to Assign *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={selectedInventoryItem?.available || selectedRequest.quantity_requested}
                        value={quantityAssigned}
                        onChange={(e) => setQuantityAssigned(parseInt(e.target.value) || 1)}
                      />
                      <small className="form-text text-muted">
                        Available: {selectedInventoryItem?.available || 0}
                      </small>
                    </div>
                  </>
                )}
                
                <div className="mb-3">
                  <label className="form-label">Admin Response</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={purchasingUpdateResponse}
                    onChange={(e) => setPurchasingUpdateResponse(e.target.value)}
                    placeholder="Add your response to the teacher..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPurchasingUpdateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={updatePurchasingRequest}
                  disabled={!dueDate || (purchasingUpdateStatus === 'approved' && !selectedInventoryItem)}
                >
                  {purchasingUpdateStatus === 'approved' ? 'Approve & Assign Item' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomRequestManagement
