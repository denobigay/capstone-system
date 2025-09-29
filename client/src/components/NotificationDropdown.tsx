import React, { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: 'overdue' | 'assigned' | 'approved' | 'rejected'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationDropdownProps {
  currentUser: { name: string; role: string }
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      
      let allNotifications: Notification[] = []
      
      try {
        // Get approved requests for this teacher
        const requestsResponse = await fetch('http://127.0.0.1:8000/api/requests')
        if (requestsResponse.ok) {
          const allRequests = await requestsResponse.json()
          const teacherRequests = allRequests
            .filter((req: any) => req.teacher_name === currentUser.name && req.status === 'approved')
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5) // Get last 5 approved requests

          const approvedNotifications = teacherRequests.map((req: any) => ({
            id: `approved-${req.id}`,
            type: 'approved' as const,
            title: 'Request Approved',
            message: `Your request for ${req.item_name} has been approved`,
            timestamp: new Date(req.created_at),
            read: false
          }))

          allNotifications = [...allNotifications, ...approvedNotifications]
        }
        
        // Get assigned items to check for overdue and almost overdue
        try {
          const assignedResponse = await fetch(`http://127.0.0.1:8000/api/requests/teacher-assigned?teacher_name=${encodeURIComponent(currentUser.name)}`)
          if (assignedResponse.ok) {
            const assignedItems = await assignedResponse.json()
            
            // Get full request details for assigned items
            const requestsResponse = await fetch('http://127.0.0.1:8000/api/requests')
            if (requestsResponse.ok) {
              const allRequests = await requestsResponse.json()
              const teacherAssignedRequests = allRequests.filter((req: any) => 
                req.teacher_name === currentUser.name && req.status === 'assigned' && req.due_date
              )

              const now = new Date()
              const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))

              teacherAssignedRequests.forEach((req: any) => {
                const dueDate = new Date(req.due_date)
                
                if (dueDate < now) {
                  // Overdue
                  allNotifications.push({
                    id: `overdue-${req.id}`,
                    type: 'overdue' as const,
                    title: 'Overdue Item Alert',
                    message: `${req.item_name} is past its return deadline`,
                    timestamp: dueDate,
                    read: false
                  })
                } else if (dueDate <= threeDaysFromNow) {
                  // Almost overdue (within 3 days)
                  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
                  allNotifications.push({
                    id: `almost-overdue-${req.id}`,
                    type: 'overdue' as const,
                    title: 'Item Due Soon',
                    message: `${req.item_name} is due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
                    timestamp: dueDate,
                    read: false
                  })
                }
              })
            }
          }
        } catch (assignedError) {
          // Assigned items API failed, continue without them
        }

        // Sort and limit notifications
        allNotifications = allNotifications
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10) // Limit to 10 most recent

        setNotifications(allNotifications)
        setUnreadCount(allNotifications.filter(n => !n.read).length)
        
      } catch (error) {
        console.error('Failed to load notifications:', error)
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

  const getNotificationIcon = (type: string, title: string) => {
    if (title.includes('Due Soon')) {
      return <i className="bi bi-clock-fill text-warning"></i>
    }
    
    switch (type) {
      case 'overdue':
        return <i className="bi bi-exclamation-triangle-fill text-danger"></i>
      case 'approved':
        return <i className="bi bi-check-circle-fill text-success"></i>
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
        onClick={() => {
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
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Notifications</h6>
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
          <div className="dropdown-divider"></div>

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
                  {getNotificationIcon(notification.type, notification.title)}
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

export default NotificationDropdown
