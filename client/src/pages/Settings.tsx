import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import TeacherTopBar from '../components/TeacherTopBar'
import AdminTopBar from '../components/AdminTopBar'

export default function Settings() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: 'bi-person' },
    { id: 'security', name: 'Security', icon: 'bi-shield-lock' },
    { id: 'notifications', name: 'Notifications', icon: 'bi-bell' },
    { id: 'appearance', name: 'Appearance', icon: 'bi-palette' },
    { id: 'system', name: 'System', icon: 'bi-gear' }
  ]

  const saveSettings = () => {
    // This would integrate with your backend API
    
    // Show success notification
    const notification = document.createElement('div')
    notification.className = 'alert alert-success notification-toast'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 8px;
      padding: 16px 20px;
      margin: 0;
      animation: slideInRight 0.3s ease-out;
    `
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-check-circle-fill me-2"></i>
        <span>Settings saved successfully!</span>
        <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  const renderProfileSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h4>Personal Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="form-control" defaultValue="Deno" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="form-control" defaultValue="Bigay" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" defaultValue="deno@admin" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-control" defaultValue="09937713553" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea className="form-control" rows={3} defaultValue="Banica, Roxas City"></textarea>
          </div>
          <div className="form-group">
            <label>Birthday</label>
            <input type="date" className="form-control" defaultValue="2002-05-03" />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Profile Photo</h4>
        <div className="profile-photo-section">
          <div className="current-photo">
            <i className="bi bi-person-circle" style={{ fontSize: '80px', color: '#cbd5e1' }}></i>
          </div>
          <div className="photo-actions">
            <button className="btn btn-primary">
              <i className="bi bi-upload"></i> Upload Photo
            </button>
            <button className="btn btn-outline-secondary">
              <i className="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h4>Change Password</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" className="form-control" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" className="form-control" placeholder="Confirm new password" />
          </div>
        </div>
        <button className="btn btn-primary">
          <i className="bi bi-shield-check"></i> Update Password
        </button>
      </div>

      <div className="settings-section">
        <h4>Two-Factor Authentication</h4>
        <div className="security-option">
          <div className="option-info">
            <h5>Enable 2FA</h5>
            <p>Add an extra layer of security to your account</p>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="enable2fa" />
            <label className="form-check-label" htmlFor="enable2fa"></label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Login Sessions</h4>
        <div className="sessions-list">
          <div className="session-item">
            <div className="session-info">
              <i className="bi bi-laptop"></i>
              <div>
                <h6>Windows 10 - Chrome</h6>
                <p>Current session • Last active: Now</p>
              </div>
            </div>
            <span className="session-status current">Current</span>
          </div>
          <div className="session-item">
            <div className="session-info">
              <i className="bi bi-phone"></i>
              <div>
                <h6>iPhone - Safari</h6>
                <p>Last active: 2 hours ago</p>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-danger">Revoke</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h4>Notification Preferences</h4>
        <div className="notification-options">
          <div className="notification-option">
            <div className="option-info">
              <h5>Email Notifications</h5>
              <p>Receive notifications via email</p>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="emailNotifications"
                checked={notifications.email}
                onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
              />
              <label className="form-check-label" htmlFor="emailNotifications"></label>
            </div>
          </div>
          
          <div className="notification-option">
            <div className="option-info">
              <h5>Push Notifications</h5>
              <p>Receive push notifications in browser</p>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="pushNotifications"
                checked={notifications.push}
                onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
              />
              <label className="form-check-label" htmlFor="pushNotifications"></label>
            </div>
          </div>
          
          <div className="notification-option">
            <div className="option-info">
              <h5>SMS Notifications</h5>
              <p>Receive notifications via SMS</p>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="smsNotifications"
                checked={notifications.sms}
                onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
              />
              <label className="form-check-label" htmlFor="smsNotifications"></label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Notification Types</h4>
        <div className="notification-types">
          <div className="notification-type">
            <div className="type-info">
              <h6>New User Registration</h6>
              <p>When a new user registers</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="newUserNotif" defaultChecked />
              <label className="form-check-label" htmlFor="newUserNotif"></label>
            </div>
          </div>
          
          <div className="notification-type">
            <div className="type-info">
              <h6>Inventory Updates</h6>
              <p>When inventory items are modified</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="inventoryNotif" defaultChecked />
              <label className="form-check-label" htmlFor="inventoryNotif"></label>
            </div>
          </div>
          
          <div className="notification-type">
            <div className="type-info">
              <h6>Request Updates</h6>
              <p>When requests are approved/rejected</p>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="requestNotif" defaultChecked />
              <label className="form-check-label" htmlFor="requestNotif"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h4>Theme Settings</h4>
        <div className="theme-options">
          <div className="theme-option">
            <div className="theme-preview light-theme">
              <div className="theme-header"></div>
              <div className="theme-content"></div>
            </div>
            <div className="theme-info">
              <h6>Light Theme</h6>
              <p>Default light appearance</p>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="theme" id="lightTheme" defaultChecked />
              <label className="form-check-label" htmlFor="lightTheme"></label>
            </div>
          </div>
          
          <div className="theme-option">
            <div className="theme-preview dark-theme">
              <div className="theme-header"></div>
              <div className="theme-content"></div>
            </div>
            <div className="theme-info">
              <h6>Dark Theme</h6>
              <p>Dark mode for low light</p>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="theme" id="darkTheme" />
              <label className="form-check-label" htmlFor="darkTheme"></label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Display Settings</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Language</label>
            <select className="form-select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Zone</label>
            <select className="form-select">
              <option value="UTC+8">Asia/Manila (UTC+8)</option>
              <option value="UTC-5">America/New_York (UTC-5)</option>
              <option value="UTC+0">UTC</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Format</label>
            <select className="form-select">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="settings-content">
      <div className="settings-section">
        <h4>System Information</h4>
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">December 15, 2024</span>
          </div>
          <div className="info-item">
            <span className="info-label">Database Size:</span>
            <span className="info-value">2.4 GB</span>
          </div>
          <div className="info-item">
            <span className="info-label">Storage Used:</span>
            <span className="info-value">45%</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Data Management</h4>
        <div className="data-actions">
          <button className="btn btn-outline-primary">
            <i className="bi bi-download"></i> Export Data
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bi bi-upload"></i> Import Data
          </button>
          <button className="btn btn-outline-warning">
            <i className="bi bi-arrow-clockwise"></i> Backup Database
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h4>Danger Zone</h4>
        <div className="danger-actions">
          <button className="btn btn-outline-danger">
            <i className="bi bi-trash"></i> Clear All Data
          </button>
          <button className="btn btn-danger">
            <i className="bi bi-exclamation-triangle"></i> Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'system':
        return renderSystemSettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        {currentUser?.role === 'ADMIN' ? (
          <AdminTopBar 
            searchPlaceholder="Search settings..." 
            currentUser={currentUser}
          />
        ) : (
          <TeacherTopBar 
            searchPlaceholder="Search settings..." 
            currentUser={currentUser}
          />
        )}
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Settings</h1>
            <p className="dashboard-subtitle">Manage your account preferences and system settings</p>
          </div>

          <div className="settings-container">
            {/* Settings Tabs */}
            <div className="settings-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="settings-main">
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="settings-actions">
                <button className="btn btn-primary" onClick={saveSettings}>
                  <i className="bi bi-check"></i> Save Changes
                </button>
                <button className="btn btn-secondary">
                  <i className="bi bi-arrow-clockwise"></i> Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
