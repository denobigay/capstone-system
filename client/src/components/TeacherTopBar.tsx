import NotificationDropdown from './NotificationDropdown'

interface TeacherTopBarProps {
  searchPlaceholder?: string
  rightContent?: React.ReactNode
  currentUser?: { name: string; role: string }
}

export default function TeacherTopBar({ 
  searchPlaceholder = "Search...", 
  rightContent, 
  currentUser 
}: TeacherTopBarProps) {
  return (
    <header className="top-bar">
      <div className="search-bar">
        <input type="text" className="search-input" placeholder={searchPlaceholder} />
        <i className="bi bi-search search-icon"></i>
      </div>
      <div className="d-flex align-items-center gap-3">
        {currentUser && (
          <NotificationDropdown currentUser={currentUser} />
        )}
        {rightContent}
      </div>
    </header>
  )
}
