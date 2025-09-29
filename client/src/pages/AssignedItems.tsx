import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/api'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'

const AssignedItems = () => {
  const { user: currentUser } = useAuth()
  const [assignedItems, setAssignedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignedItems = async () => {
      try {
        const response = await apiFetch('/api/requests')
        if (response.ok) {
          const requestsData = await response.json()
          // Filter for assigned items
          const assigned = requestsData.filter((r: any) => 
            r.status === 'assigned' || r.status === 'returned'
          )
          setAssignedItems(assigned)
        }
      } catch (error) {
        console.error('Error fetching assigned items:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchAssignedItems()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const returnItem = async (requestId: number) => {
    if (window.confirm('Are you sure you want to return this item?')) {
      try {
        const response = await apiFetch(`/api/requests/${requestId}/teacher-return`, {
          method: 'POST'
        })
        
        if (response.ok) {
          // Refresh the list
          const response = await apiFetch('/api/requests')
          if (response.ok) {
            const requestsData = await response.json()
            const assigned = requestsData.filter((r: any) => 
              r.status === 'assigned' || r.status === 'returned'
            )
            setAssignedItems(assigned)
          }
          alert('Item returned successfully!')
        } else {
          alert('Failed to return item')
        }
      } catch (error) {
        console.error('Error returning item:', error)
        alert('Error returning item')
      }
    }
  }

  // Admin View - All Assigned Items
  const AdminView = () => {
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
            All Assigned Items
          </h4>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Teacher</th>
                  <th>Quantity</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedItems.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.item_name}</td>
                    <td>{item.teacher_name}</td>
                    <td>{item.quantity_assigned || item.quantity_requested}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'assigned' ? 'bg-info' :
                        item.status === 'returned' ? 'bg-success' :
                        'bg-light text-dark'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {item.status === 'assigned' && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => returnItem(item.id)}
                            title="Mark as Returned"
                          >
                            <i className="bi bi-arrow-return-left"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="row">
          <div className="col-md-4">
            <div className="card border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-box-seam me-2"></i>
                  Currently Assigned
                </h6>
              </div>
              <div className="card-body">
                <h4 className="text-info">
                  {assignedItems.filter(item => item.status === 'assigned').length}
                </h4>
                <p className="text-muted mb-0">Items currently assigned</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Returned
                </h6>
              </div>
              <div className="card-body">
                <h4 className="text-success">
                  {assignedItems.filter(item => item.status === 'returned').length}
                </h4>
                <p className="text-muted mb-0">Items returned</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-warning">
              <div className="card-header bg-warning text-white">
                <h6 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Overdue
                </h6>
              </div>
              <div className="card-body">
                <h4 className="text-warning">
                  {assignedItems.filter(item => 
                    item.status === 'assigned' && 
                    item.due_date && 
                    new Date(item.due_date) < new Date()
                  ).length}
                </h4>
                <p className="text-muted mb-0">Overdue items</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Teacher View - My Assigned Items
  const TeacherView = () => {
    const myAssignedItems = assignedItems.filter((item: any) => 
      String(item.teacher_name).toLowerCase() === String(currentUser.name).toLowerCase()
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
            My Assigned Items
          </h4>
          <p className="text-muted">Items currently assigned to you</p>
        </div>

        {myAssignedItems.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myAssignedItems.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity_assigned || item.quantity_requested}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'assigned' ? 'bg-info' :
                        item.status === 'returned' ? 'bg-success' :
                        'bg-light text-dark'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'assigned' && (
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => returnItem(item.id)}
                          title="Return Item"
                        >
                          <i className="bi bi-arrow-return-left me-1"></i>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <h5 className="mt-3 text-muted">No Assigned Items</h5>
            <p className="text-muted">You don't have any items assigned to you yet.</p>
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
    <>
      <Sidebar currentUser={currentUser} />
      {currentUser.role === 'ADMIN' ? <AdminTopBar /> : <TeacherTopBar />}
      
      <div className="main-content">
        <div className="container-fluid py-4">
          {currentUser.role === 'ADMIN' ? <AdminView /> : <TeacherView />}
        </div>
      </div>
    </>
  )
}

export default AssignedItems
