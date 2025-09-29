import React from 'react'
import NotificationDropdown from './NotificationDropdown'
import AdminNotificationDropdown from './AdminNotificationDropdown'

interface TopBarProps {
  variant: 'dashboard' | 'users' | 'default'
  searchPlaceholder?: string
  rightContent?: React.ReactNode
  currentUser?: { name: string; role: string }
  showNotifications?: boolean
}

export default function TopBar({ variant, searchPlaceholder = "Search...", rightContent, currentUser, showNotifications = true }: TopBarProps) {
  if (variant === 'dashboard') {
    return (
      <header className="top-bar dashboard-layout">
        <div className="search-bar">
          <input type="text" className="search-input" placeholder={searchPlaceholder} />
          <i className="bi bi-search search-icon"></i>
        </div>
        <div className="d-flex align-items-center gap-3">
          {showNotifications && currentUser && (
            currentUser.role === 'ADMIN' ? (
              <AdminNotificationDropdown currentUser={currentUser} />
            ) : (
              <NotificationDropdown currentUser={currentUser} />
            )
          )}
          {rightContent}
        </div>
      </header>
    )
  }

  if (variant === 'users') {
    return (
      <header className="top-bar users-layout">
        <div className="search-bar">
          <input type="text" className="search-input" placeholder={searchPlaceholder} />
          <i className="bi bi-search search-icon"></i>
        </div>
        {rightContent}
      </header>
    )
  }

  return (
    <header className="top-bar">
      <div className="search-bar">
        <input type="text" className="search-input" placeholder={searchPlaceholder} />
        <i className="bi bi-search search-icon"></i>
      </div>
      <div className="d-flex align-items-center gap-3">
        {showNotifications && currentUser && (
          currentUser.role === 'ADMIN' ? (
            <AdminNotificationDropdown currentUser={currentUser} />
          ) : (
            <NotificationDropdown currentUser={currentUser} />
          )
        )}
        {rightContent}
      </div>
    </header>
  )
}
