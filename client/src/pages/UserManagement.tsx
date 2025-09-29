import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'
import { showNotification } from '../utils/notifications'

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  
  const [selectedRole, setSelectedRole] = useState('All Roles')
  const [users, setUsers] = useState<Array<any>>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formMiddleName, setFormMiddleName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<'ADMIN' | 'TEACHER'>('ADMIN')
  const [formContact, setFormContact] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formBirthday, setFormBirthday] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formPasswordConfirm, setFormPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  // Edit form state
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editMiddleName, setEditMiddleName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'ADMIN' | 'TEACHER'>('ADMIN')
  const [editContact, setEditContact] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editBirthday, setEditBirthday] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('')
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showEditPasswordConfirm, setShowEditPasswordConfirm] = useState(false)
  const editPhotoInputRef = useRef<HTMLInputElement | null>(null)


  useEffect(() => {
    setLoading(true)
    setError(null)
    
    fetch('http://127.0.0.1:8000/api/users')
      .then(r => {
        return r.json()
      })
             .then(data => {
         // Ensure each user has a full_name property
         const usersWithFullName = data.map((user: any) => ({
           ...user,
           full_name: user.full_name || `${user.first_name} ${user.last_name}`
         }))
         
         
         setUsers(usersWithFullName)
         setLoading(false)
       })
      .catch(err => {
        console.error('Error fetching users:', err)
        setError(err.message)
        setUsers([])
        setLoading(false)
      })
  }, [])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return 'badge-warning'
      case 'TEACHER':
        return 'badge-info'
      default:
        return 'badge-secondary'
    }
  }

  const toggleRowExpansion = (userId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  const handleAddUser = () => {
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || !formPassword.trim()) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    if (formPassword !== formPasswordConfirm) {
      showNotification('Passwords do not match', 'error')
      return
    }

    const formData = new FormData()
    formData.append('first_name', formFirstName)
    formData.append('last_name', formLastName)
    if (formMiddleName) formData.append('middle_name', formMiddleName)
    formData.append('email', formEmail)
    formData.append('password', formPassword)
    formData.append('password_confirmation', formPasswordConfirm)
    formData.append('role', formRole)
    if (formContact) formData.append('contact_number', formContact)
    if (formAddress) formData.append('address', formAddress)
    if (formBirthday) formData.append('birthday', formBirthday)
    if (photoInputRef.current?.files?.[0]) {
      formData.append('photo', photoInputRef.current.files[0])
    }

    fetch('http://127.0.0.1:8000/api/users', {
      method: 'POST',
      body: formData,
    })
      .then(async (r) => {
        if (!r.ok) {
          let errorMessage = 'Failed to create user'
          try {
            const errorData = await r.json()
            if (errorData.errors) {
              // Handle validation errors
              const errorMessages = Object.values(errorData.errors).flat()
              errorMessage = errorMessages.join(', ')
            } else if (errorData.message) {
              errorMessage = errorData.message
            }
          } catch (jsonError) {
            const errorText = await r.text()
            errorMessage = errorText || errorMessage
          }
          throw new Error(errorMessage)
        }
        return r.json()
      })
      .then((created) => {
        setUsers(prev => [created, ...prev])
        
        // Show success notification
        showNotification('User added successfully!', 'success')
        
        // Reset form
        setFormFirstName('')
        setFormLastName('')
        setFormMiddleName('')
        setFormEmail('')
        setFormPassword('')
        setFormPasswordConfirm('')
        setFormRole('ADMIN')
        setFormContact('')
        setFormAddress('')
        setFormBirthday('')
        setShowPassword(false)
        setShowPasswordConfirm(false)
        if (photoInputRef.current) photoInputRef.current.value = ''
        
        // Close modal
        const modal = document.getElementById('addUserModal')
        if (modal) {
          const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
          if (modalInstance) {
            modalInstance.hide()
          } else {
            // Fallback: remove modal classes manually
            modal.classList.remove('show', 'd-block')
            modal.style.display = 'none'
            document.body.classList.remove('modal-open')
            const backdrop = document.querySelector('.modal-backdrop')
            if (backdrop) backdrop.remove()
          }
        }
      })
      .catch((err) => {
        console.error('Failed to create user', err)
        showNotification('Failed to create user. Please check your inputs.', 'error')
      })
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setEditFirstName(user.first_name)
    setEditLastName(user.last_name)
    setEditMiddleName(user.middle_name || '')
    setEditEmail(user.email)
    setEditRole(user.role)
    setEditContact(user.contact_number || '')
    setEditAddress(user.address || '')
    setEditBirthday(user.birthday ? user.birthday.split('T')[0] : '')
    setEditPassword('')
    setEditPasswordConfirm('')
    setShowEditPassword(false)
    setShowEditPasswordConfirm(false)
  }

  const handleUpdateUser = () => {
    
    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    if (editPassword && editPassword !== editPasswordConfirm) {
      showNotification('Passwords do not match', 'error')
      return
    }

    const url = `http://127.0.0.1:8000/api/users/${editingUser.id}`

    // Check if there's a file to upload
    const hasFile = editPhotoInputRef.current?.files?.[0]
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('first_name', editFirstName)
      formData.append('last_name', editLastName)
      if (editMiddleName) formData.append('middle_name', editMiddleName)
      formData.append('email', editEmail)
      if (editPassword) {
        formData.append('password', editPassword)
        formData.append('password_confirmation', editPasswordConfirm)
      }
      formData.append('role', editRole)
      if (editContact) formData.append('contact_number', editContact)
      if (editAddress) formData.append('address', editAddress)
      if (editBirthday) formData.append('birthday', editBirthday)
             formData.append('photo', hasFile)
       formData.append('_method', 'PUT')


             fetch(url, {
         method: 'POST',
         body: formData,
       })
        .then(async (r) => {
          
          if (!r.ok) {
            const errorText = await r.text()
            console.error('Server error response:', errorText)
            throw new Error(errorText)
          }
          return r.json()
        })
        .then((updated) => {
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
          setEditingUser(null)
          
          // Close the modal
          const modal = document.getElementById('editUserModal')
          if (modal) {
            const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
            if (modalInstance) {
              modalInstance.hide()
            } else {
              // Fallback: remove modal classes manually
              modal.classList.remove('show', 'd-block')
              modal.style.display = 'none'
              document.body.classList.remove('modal-open')
              const backdrop = document.querySelector('.modal-backdrop')
              if (backdrop) backdrop.remove()
            }
          }
          
          // Show success notification
          showNotification('User updated successfully!', 'success')
          
          // Reset edit form
          setEditFirstName('')
          setEditLastName('')
          setEditMiddleName('')
          setEditEmail('')
          setEditPassword('')
          setEditPasswordConfirm('')
          setEditRole('ADMIN')
          setEditContact('')
          setEditAddress('')
          setEditBirthday('')
          setShowEditPassword(false)
          setShowEditPasswordConfirm(false)
          if (editPhotoInputRef.current) editPhotoInputRef.current.value = ''
        })
                .catch((err) => {
          console.error('Failed to update user', err)
          console.error('Error details:', err)
          showNotification(`Failed to update user: ${err.message || 'Unknown error occurred'}`, 'error')
          
          // Close the modal even on error
          const modal = document.getElementById('editUserModal')
          if (modal) {
            const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
            if (modalInstance) {
              modalInstance.hide()
            } else {
              // Fallback: remove modal classes manually
              modal.classList.remove('show', 'd-block')
              modal.style.display = 'none'
              document.body.classList.remove('modal-open')
              const backdrop = document.querySelector('.modal-backdrop')
              if (backdrop) backdrop.remove()
            }
          }
          
          // Reset edit form on error as well
          setEditFirstName('')
          setEditLastName('')
          setEditMiddleName('')
          setEditEmail('')
          setEditPassword('')
          setEditPasswordConfirm('')
          setEditRole('ADMIN')
          setEditContact('')
          setEditAddress('')
          setEditBirthday('')
          setShowEditPassword(false)
          setShowEditPasswordConfirm(false)
          if (editPhotoInputRef.current) editPhotoInputRef.current.value = ''
        })
      } else {
      // Use JSON for text-only updates
      const updateData: any = {
        first_name: editFirstName,
        last_name: editLastName,
        email: editEmail,
        role: editRole
      }
      
      if (editMiddleName) updateData.middle_name = editMiddleName
      if (editPassword) {
        updateData.password = editPassword
        updateData.password_confirmation = editPasswordConfirm
      }
      if (editContact) updateData.contact_number = editContact
      if (editAddress) updateData.address = editAddress
             if (editBirthday) updateData.birthday = editBirthday
       
       // Add _method field for Laravel to recognize this as PUT request
       updateData._method = 'PUT'


             fetch(url, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json',
         },
         body: JSON.stringify(updateData),
       })
        .then(async (r) => {
          
          if (!r.ok) {
            const errorText = await r.text()
            console.error('Server error response:', errorText)
            throw new Error(errorText)
          }
          return r.json()
        })
        .then((updated) => {
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
          setEditingUser(null)
          
          // Close the modal
          const modal = document.getElementById('editUserModal')
          if (modal) {
            const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
            if (modalInstance) {
              modalInstance.hide()
            } else {
              // Fallback: remove modal classes manually
              modal.classList.remove('show', 'd-block')
              modal.style.display = 'none'
              document.body.classList.remove('modal-open')
              const backdrop = document.querySelector('.modal-backdrop')
              if (backdrop) backdrop.remove()
            }
          }
          
          // Show success notification
          showNotification('User updated successfully!', 'success')
          
          // Reset edit form
          setEditFirstName('')
          setEditLastName('')
          setEditMiddleName('')
          setEditEmail('')
          setEditPassword('')
          setEditPasswordConfirm('')
          setEditRole('ADMIN')
          setEditContact('')
          setEditAddress('')
          setEditBirthday('')
          setShowEditPassword(false)
          setShowEditPasswordConfirm(false)
          if (editPhotoInputRef.current) editPhotoInputRef.current.value = ''
        })
        .catch((err) => {
          console.error('Failed to update user', err)
          console.error('Error details:', err)
          showNotification(`Failed to update user: ${err.message || 'Unknown error occurred'}`, 'error')
          
          // Close the modal even on error
          const modal = document.getElementById('editUserModal')
          if (modal) {
            const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
            if (modalInstance) {
              modalInstance.hide()
            } else {
              // Fallback: remove modal classes manually
              modal.classList.remove('show', 'd-block')
              modal.style.display = 'none'
              document.body.classList.remove('modal-open')
              const backdrop = document.querySelector('.modal-backdrop')
              if (backdrop) backdrop.remove()
            }
          }
          
          // Reset edit form on error as well
          setEditFirstName('')
          setEditLastName('')
          setEditMiddleName('')
          setEditEmail('')
          setEditPassword('')
          setEditPasswordConfirm('')
          setEditRole('ADMIN')
          setEditContact('')
          setEditAddress('')
          setEditBirthday('')
          setShowEditPassword(false)
          setShowEditPasswordConfirm(false)
          if (editPhotoInputRef.current) editPhotoInputRef.current.value = ''
        })
    }
  }

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
        method: 'DELETE',
      })
        .then(async (r) => {
          if (!r.ok) {
            const errorText = await r.text()
            throw new Error(errorText)
          }
          return r.json()
        })
        .then(() => {
          setUsers(prev => prev.filter(u => u.id !== userId))
          showNotification('User deleted successfully!', 'success')
        })
        .catch((err) => {
          console.error('Failed to delete user', err)
          showNotification('Failed to delete user.', 'error')
        })
    }
  }

  const addUserButton = (
    <button 
      className="add-user-btn"
      data-bs-toggle="modal"
      data-bs-target="#addUserModal"
    >
      <i className="bi bi-plus"></i> Add User
    </button>
  )

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <AdminTopBar 
          searchPlaceholder="Search users..." 
          currentUser={currentUser}
          rightContent={addUserButton}
        />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">User Management</h1>
            <p className="dashboard-subtitle">Manage school staff, administrators, and teachers</p>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Users Table */}
          {!loading && !error && (
            <div className="users-section">
              <div className="section-header">
                <h3>All Users</h3>
                <select 
                  className="role-filter"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option>All Roles</option>
                  <option>Administrator</option>
                  <option>Teacher</option>
                </select>
              </div>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}></th>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <i className="bi bi-people" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                          <p className="mt-2 text-muted">No users found</p>
                          <p className="text-muted">Click "Add User" to create your first user</p>
                        </td>
                      </tr>
                    ) : (
                      users
                        .filter(u => selectedRole === 'All Roles' 
                          || (selectedRole === 'Administrator' && (u.role === 'ADMIN' || u.role === 'ADMINISTRATOR'))
                          || (selectedRole === 'Teacher' && u.role === 'TEACHER')
                        )
                        .map((user: any) => (
                        <React.Fragment key={user.id}>
                          <tr 
                            className={expandedRows.has(user.id) ? 'expanded-row' : ''}
                            onClick={() => toggleRowExpansion(user.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <i className={`bi ${expandedRows.has(user.id) ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                            </td>
                            <td>
                              <span className="user-id">#{String(user.id).padStart(3, '0')}</span>
                            </td>
                            <td>
                              <div className="user-info-cell">
                                <span>{user.full_name || `${user.first_name} ${user.last_name}`}</span>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="action-btn-edit"
                                  onClick={() => handleEditUser(user)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#editUserModal"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="action-btn-delete"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows.has(user.id) && (
                            <tr className="expanded-details">
                              <td colSpan={6}>
                                <div className="user-details-grid">
                                                                     <div className="detail-item profile-photo-section">
                                     <label>Profile Photo:</label>
                                                                            <div className="profile-photo-display">
                                        {user.photo_path ? (
                                          <>
                                            <img 
                                              src={`http://127.0.0.1:8000/${user.photo_path}`}
                                              alt={user.full_name}
                                              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                                              onError={(e) => {
                                                console.error('Failed to load profile photo:', user.photo_path)
                                                e.currentTarget.style.display = 'none'
                                                e.currentTarget.nextElementSibling?.classList.remove('d-none')
                                              }}
                                            />
                                            <div className="profile-photo-placeholder d-none">
                                              <i className="bi bi-person-circle" style={{ fontSize: 60, color: '#cbd5e1' }}></i>
                                            </div>
                                          </>
                                        ) : (
                                          <div className="profile-photo-placeholder">
                                            <i className="bi bi-person-circle" style={{ fontSize: 60, color: '#cbd5e1' }}></i>
                                          </div>
                                        )}
                                     </div>
                                   </div>
                                  
                                  <div className="user-info-section">
                                    {/* First Row: First Name, Middle Name, Last Name */}
                                    <div className="info-row">
                                      <div className="detail-item">
                                        <label>First Name:</label>
                                        <span>{user.first_name}</span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Middle Name:</label>
                                        <span>{user.middle_name || '-'}</span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Last Name:</label>
                                        <span>{user.last_name}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Second Row: Email, Contact, Role */}
                                    <div className="info-row">
                                      <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{user.email}</span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Contact Number:</label>
                                        <span>{user.contact_number || '-'}</span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Role:</label>
                                        <span>{user.role}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Third Row: Address, Birthday */}
                                    <div className="info-row">
                                      <div className="detail-item">
                                        <label>Address:</label>
                                        <span>{user.address || '-'}</span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Birthday:</label>
                                        <span>{user.birthday ? new Date(user.birthday).toLocaleDateString() : '-'}</span>
                                      </div>
                                      <div className="detail-item">
                                        {/* Empty space to maintain grid alignment */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      <div className="modal fade" id="addUserModal" tabIndex={-1} aria-labelledby="addUserModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addUserModalLabel">Add User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Juan"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Dela Cruz"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Santos"
                    value={formMiddleName}
                    onChange={(e) => setFormMiddleName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="name@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role *</label>
                  <select 
                    className="form-select"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'ADMIN' | 'TEACHER')}
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password *</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="form-control" 
                      placeholder="••••••••"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm Password *</label>
                  <div className="input-group">
                    <input 
                      type={showPasswordConfirm ? "text" : "password"}
                      className="form-control" 
                      placeholder="••••••••"
                      value={formPasswordConfirm}
                      onChange={(e) => setFormPasswordConfirm(e.target.value)}
                      required
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                      <i className={`bi ${showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="09xxxxxxxxx"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Birthday</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formBirthday}
                    onChange={(e) => setFormBirthday(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Street, City, Province"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Profile Photo</label>
                  <input 
                    ref={photoInputRef}
                    type="file" 
                    accept="image/*"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleAddUser}
              >Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade" id="editUserModal" tabIndex={-1} aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Juan"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Dela Cruz"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Santos"
                    value={editMiddleName}
                    onChange={(e) => setEditMiddleName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="name@example.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role *</label>
                  <select 
                    className="form-select"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'ADMIN' | 'TEACHER')}
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password (leave blank to keep current)</label>
                  <div className="input-group">
                    <input 
                      type={showEditPassword ? "text" : "password"}
                      className="form-control" 
                      placeholder="••••••••"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                    >
                      <i className={`bi ${showEditPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input 
                      type={showEditPasswordConfirm ? "text" : "password"}
                      className="form-control" 
                      placeholder="••••••••"
                      value={editPasswordConfirm}
                      onChange={(e) => setEditPasswordConfirm(e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowEditPasswordConfirm(!showEditPasswordConfirm)}
                    >
                      <i className={`bi ${showEditPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="09xxxxxxxxx"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Birthday</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editBirthday}
                    onChange={(e) => setEditBirthday(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Street, City, Province"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Profile Photo (leave empty to keep current)</label>
                  <input 
                    ref={editPhotoInputRef}
                    type="file" 
                    accept="image/*"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleUpdateUser}
              >Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
