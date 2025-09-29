import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'
import ItemRequestForm from '../components/ItemRequestForm'

const ItemRequestPage = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [approvalDueDate, setApprovalDueDate] = useState('')
  const [approvalQuantity, setApprovalQuantity] = useState(1)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsResponse = await apiFetch('/api/requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setRequests(requestsData)
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
        setRequests(requestsData)
      }
    } catch (error) {
      console.error('Error refreshing requests:', error)
    }
  }

  // Request management functions
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

  // Admin View - Manage Item Requests
  const AdminView = () => {
    const itemRequests = requests.filter((r: any) => r.request_type === 'item' || !r.request_type)
    
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
            <i className="bi bi-box-seam me-2"></i>
            Item Requests Management
          </h4>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
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
                {itemRequests.map((request: any) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.teacher_name}</td>
                    <td>{request.item_name}</td>
                    <td>{request.quantity_requested}</td>
                    <td>
                      <span className={`badge ${
                        request.status === 'pending' ? 'bg-warning' :
                        request.status === 'approved' ? 'bg-success' :
                        request.status === 'assigned' ? 'bg-info' :
                        request.status === 'returned' ? 'bg-secondary' :
                        'bg-light text-dark'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request History */}
        <div className="request-status-card" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="bi bi-clock-history me-2"></i>
            Assigned Items History
          </h4>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Teacher</th>
                  <th>Quantity</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {itemRequests.filter((r: any) => r.status === 'assigned' || r.status === 'returned').map((request: any) => (
                  <tr key={request.id}>
                    <td>{request.item_name}</td>
                    <td>{request.teacher_name}</td>
                    <td>{request.quantity_assigned || request.quantity_requested}</td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>{request.due_date ? new Date(request.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        request.status === 'assigned' ? 'bg-info' :
                        request.status === 'returned' ? 'bg-success' :
                        'bg-light text-dark'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
      </>
    )
  }

  // Teacher View - Submit Item Requests
  const TeacherView = () => {
    const myRequests = requests.filter((r: any) => 
      String(r.teacher_name).toLowerCase() === String(currentUser.name).toLowerCase() &&
      (r.request_type === 'item' || !r.request_type)
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
            <i className="bi bi-box-seam me-2"></i>
            Request Items from Inventory
          </h4>
          <p className="text-muted">Select items you need from the available inventory</p>
        </div>

        <ItemRequestForm currentUser={currentUser} onRequestSubmit={refreshRequests} />

        {/* My Item Requests History */}
        {myRequests.length > 0 && (
          <div className="request-status-card" style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px'
          }}>
            <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
              <i className="bi bi-clock-history me-2"></i>
              My Item Requests
            </h4>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Request Date</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((request: any) => (
                    <tr key={request.id}>
                      <td>{request.item_name}</td>
                      <td>{request.quantity_requested}</td>
                      <td>
                        <span className={`badge ${
                          request.status === 'pending' ? 'bg-warning' :
                          request.status === 'approved' ? 'bg-success' :
                          request.status === 'assigned' ? 'bg-info' :
                          request.status === 'returned' ? 'bg-secondary' :
                          'bg-light text-dark'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.created_at).toLocaleDateString()}</td>
                      <td>{request.due_date ? new Date(request.due_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
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

export default ItemRequestPage
