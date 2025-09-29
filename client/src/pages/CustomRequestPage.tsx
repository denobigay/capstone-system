import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'
import CustomRequestForm from '../components/CustomRequestForm'

const CustomRequestPage = () => {
  const { user: currentUser } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (currentUser?.role === 'ADMIN') {
          // For admin, fetch all custom requests
          const requestsResponse = await apiFetch('/api/custom-requests')
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json()
            setRequests(requestsData)
          }
        } else {
          // For teacher, fetch their custom requests
          const requestsResponse = await apiFetch('/api/custom-requests')
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json()
            const teacherRequests = requestsData.filter((r: any) => r.teacher_id === currentUser?.id)
            setRequests(teacherRequests)
          }
        }
      } catch (error) {
        console.error('Error fetching custom requests:', error)
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
      if (currentUser?.role === 'ADMIN') {
        const requestsResponse = await apiFetch('/api/custom-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setRequests(requestsData)
        }
      } else {
        const requestsResponse = await apiFetch('/api/custom-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          const teacherRequests = requestsData.filter((r: any) => r.teacher_id === currentUser?.id)
          setRequests(teacherRequests)
        }
      }
    } catch (error) {
      console.error('Error refreshing custom requests:', error)
    }
  }

  // Admin View - Manage Custom Requests
  const AdminView = () => {
    const customRequests = requests
    
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
            <i className="bi bi-sliders me-2"></i>
            Custom Requests Management
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
                {customRequests.map((request: any) => (
                  <tr key={request.id}>
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
                    <td>
                      <div className="btn-group btn-group-sm">
                        {request.status === 'pending' && (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Request History */}
        <div className="request-status-card" style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="bi bi-clock-history me-2"></i>
            Custom Request History
          </h4>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Teacher</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Admin Response</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {customRequests.map((request: any) => (
                  <tr key={request.id}>
                    <td>{request.item_name}</td>
                    <td>{request.teacher_name}</td>
                    <td>{request.description || 'N/A'}</td>
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
                    <td>{request.admin_response || 'No response yet'}</td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  // Teacher View - Submit Custom Requests
  const TeacherView = () => {
    const myRequests = requests // Already filtered for current teacher
    
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
            <i className="bi bi-sliders me-2"></i>
            Request Custom Items
          </h4>
          <p className="text-muted">Request items that are not available in the current inventory</p>
        </div>

        <CustomRequestForm currentUser={currentUser} onRequestSubmit={refreshRequests} />

        {/* My Custom Requests History */}
        {myRequests.length > 0 && (
          <div className="request-status-card" style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ margin: 0, color: '#1e40af' }}>
                <i className="bi bi-clock-history me-2"></i>
                My Custom Request History
              </h4>
              <div className="d-flex gap-2">
                <span className="badge bg-warning">
                  Pending: {myRequests.filter((r: any) => r.status === 'pending').length}
                </span>
                <span className="badge bg-info">
                  Under Review: {myRequests.filter((r: any) => r.status === 'under_review').length}
                </span>
                <span className="badge bg-primary">
                  Purchasing: {myRequests.filter((r: any) => r.status === 'purchasing').length}
                </span>
                <span className="badge bg-success">
                  Approved: {myRequests.filter((r: any) => r.status === 'approved').length}
                </span>
                <span className="badge bg-danger">
                  Rejected: {myRequests.filter((r: any) => r.status === 'rejected').length}
                </span>
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
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((request: any) => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
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
                          <i className={`bi ${
                            request.status === 'pending' ? 'bi-clock' :
                            request.status === 'under_review' ? 'bi-search' :
                            request.status === 'purchasing' ? 'bi-cart' :
                            request.status === 'approved' ? 'bi-check-circle' :
                            request.status === 'rejected' ? 'bi-x-circle' :
                            'bi-question-circle'
                          } me-1`}></i>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {request.admin_response ? (
                          <span className="text-success">
                            <i className="bi bi-chat-dots me-1"></i>
                            Response Available
                          </span>
                        ) : (
                          <span className="text-muted">No response yet</span>
                        )}
                      </td>
                      <td>{new Date(request.created_at).toLocaleDateString()}</td>
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

export default CustomRequestPage
