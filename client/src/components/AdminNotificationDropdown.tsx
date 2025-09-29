import React, { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: 'pending' | 'overdue' | 'assigned' | 'urgent'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface AdminNotificationDropdownProps {
  currentUser: { name: string; role: string }
}

const AdminNotificationDropdown: React.FC<AdminNotificationDropdownProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      let allNotifications: Notification[] = []
      
      try {
        // Get pending requests
        const requestsResponse = await fetch('http://127.0.0.1:8000/api/requests')
        if (requestsResponse.ok) {
          const allRequests = await requestsResponse.json()
          const now = new Date()
          
          // Pending requests
          const pendingRequests = allRequests.filter((req: any) => req.status === 'pending')
          const pendingNotifications = pendingRequests.map((req: any) => ({
            id: `pending-${req.id}`,
            type: 'pending' as const,
            title: 'Pending Request',
            message: `${req.teacher_name} requested ${req.item_name}`,
            timestamp: new Date(req.created_at),
            read: false
          }))
          allNotifications = [...allNotifications, ...pendingNotifications]

          // Overdue items (assigned but not returned)
          const overdueRequests = allRequests.filter((req: any) => 
            req.status === 'assigned' && 
            req.due_date && 
            new Date(req.due_date) < now
          )
          const overdueNotifications = overdueRequests.map((req: any) => ({
            id: `overdue-${req.id}`,
            type: 'overdue' as const,
            title: 'Overdue Item',
            message: `${req.teacher_name} hasn't returned ${req.item_name}`,
            timestamp: new Date(req.due_date),
            read: false
          }))
          allNotifications = [...allNotifications, ...overdueNotifications]

          // Recently assigned items
          const assignedRequests = allRequests.filter((req: any) => 
            req.status === 'assigned' && 
            req.assigned_at &&
            new Date(req.assigned_at) > new Date(now.getTime() - (24 * 60 * 60 * 1000)) // Last 24 hours
          )
          const assignedNotifications = assignedRequests.map((req: any) => ({
            id: `assigned-${req.id}`,
            type: 'assigned' as const,
            title: 'Item Assigned',
            message: `Assigned ${req.item_name} to ${req.teacher_name}`,
            timestamp: new Date(req.assigned_at),
            read: false
          }))
          allNotifications = [...allNotifications, ...assignedNotifications]

          // Urgent requests (high priority)
          const urgentRequests = allRequests.filter((req: any) => 
            req.status === 'pending' && 
            req.priority === 'urgent'
          )
          const urgentNotifications = urgentRequests.map((req: any) => ({
            id: `urgent-${req.id}`,
            type: 'urgent' as const,
            title: 'Urgent Request',
            message: `URGENT: ${req.teacher_name} needs ${req.item_name}`,
            timestamp: new Date(req.created_at),
            read: false
          }))
          allNotifications = [...allNotifications, ...urgentNotifications]
        }

        // Sort and limit notifications
        allNotifications = allNotifications
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 15) // Limit to 15 most recent

        setNotifications(allNotifications)
        setUnreadCount(allNotifications.filter(n => !n.read).length)
        
      } catch (error) {
        console.error('Failed to load admin notifications:', error)
        setNotifications([])
        setUnreadCount(0)
      }
    }

    if (currentUser?.name) {
      loadNotifications()
    }
  }, [currentUser?.name])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pending':
        return <i className="bi bi-clock-fill text-warning"></i>
      case 'overdue':
        return <i className="bi bi-exclamation-triangle-fill text-danger"></i>
      case 'assigned':
        return <i className="bi bi-person-check text-info"></i>
      case 'urgent':
        return <i className="bi bi-lightning-fill text-danger"></i>
      default:
        return <i className="bi bi-bell text-primary"></i>
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div 
      className="notification-dropdown" 
      ref={dropdownRef}
      style={{ position: 'relative' }}
    >
      {/* Bell Icon */}
      <button
        className="btn btn-link position-relative p-2"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        style={{ 
          color: '#6c757d',
          textDecoration: 'none',
          border: 'none',
          background: 'none',
          cursor: 'pointer'
        }}
      >
        <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
        {unreadCount > 0 && (
          <span 
            className="badge bg-danger position-absolute top-0 start-100 translate-middle"
            style={{ 
              fontSize: '0.7rem',
              minWidth: '18px',
              height: '18px',
              borderRadius: '50%'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            minWidth: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'block',
            marginTop: '5px',
            padding: '0'
          }}
        >
          {/* Header */}
          <div className="dropdown-header d-flex justify-content-between align-items-center" style={{ padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
            <h6 className="mb-0">Admin Notifications</h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-link p-0"
                onClick={markAllAsRead}
                style={{ fontSize: '0.8rem' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-bell-slash" style={{ fontSize: '2rem' }}></i>
              <p className="mt-2 mb-0">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`dropdown-item d-flex align-items-start p-3 ${
                  !notification.read ? 'bg-light' : ''
                }`}
                style={{ 
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8f9fa'
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="me-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1" style={{ fontSize: '0.9rem' }}>
                      {notification.title}
                    </h6>
                    <small className="text-muted">
                      {formatTimestamp(notification.timestamp)}
                    </small>
                  </div>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="ms-2">
                    <div 
                      className="bg-primary rounded-circle"
                      style={{ width: '8px', height: '8px' }}
                    ></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminNotificationDropdown
