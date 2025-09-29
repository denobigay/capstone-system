import React from 'react'
import AdminNotificationDropdown from './AdminNotificationDropdown'

interface AdminTopBarProps {
  searchPlaceholder?: string
  rightContent?: React.ReactNode
  currentUser?: { name: string; role: string }
}

export default function AdminTopBar({ 
  searchPlaceholder = "Search...", 
  rightContent, 
  currentUser 
}: AdminTopBarProps) {
  return (
    <header className="top-bar">
      <div className="search-bar">
        <input type="text" className="search-input" placeholder={searchPlaceholder} />
        <i className="bi bi-search search-icon"></i>
      </div>
      <div className="d-flex align-items-center gap-3">
        {currentUser && (
          <AdminNotificationDropdown currentUser={currentUser} />
        )}
        {rightContent}
      </div>
    </header>
  )
}
