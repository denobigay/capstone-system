import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

export default function Reports() {
  const { user: currentUser } = useAuth()
  const [selectedReportType, setSelectedReportType] = useState('inventory')
  const [dateRange, setDateRange] = useState('last30days')

  const reportTypes = [
    { id: 'inventory', name: 'Inventory Report', icon: 'bi-box' },
    { id: 'users', name: 'User Activity', icon: 'bi-people' },
    { id: 'requests', name: 'Request History', icon: 'bi-file-earmark-text' },
    { id: 'costs', name: 'Cost Analysis', icon: 'bi-graph-up' }
  ]

  const dateRanges = [
    { id: 'last7days', name: 'Last 7 Days' },
    { id: 'last30days', name: 'Last 30 Days' },
    { id: 'last90days', name: 'Last 90 Days' },
    { id: 'custom', name: 'Custom Range' }
  ]

  const generateReport = () => {
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
        <span>Report generated successfully!</span>
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

  const downloadReport = () => {
    // This would trigger a download
    const notification = document.createElement('div')
    notification.className = 'alert alert-info notification-toast'
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
        <i class="bi bi-download me-2"></i>
        <span>Report download started...</span>
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <AdminTopBar 
          searchPlaceholder="Search reports..." 
          currentUser={currentUser}
        />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Reports</h1>
            <p className="dashboard-subtitle">Generate and download comprehensive reports for your property management system.</p>
          </div>

          {/* Report Configuration */}
          <div className="reports-section">
            <div className="section-header">
              <h3>Report Configuration</h3>
            </div>
            
            <div className="report-config-grid">
              {/* Report Type Selection */}
              <div className="config-card">
                <h4>Report Type</h4>
                <div className="report-type-grid">
                  {reportTypes.map((type) => (
                    <div 
                      key={type.id}
                      className={`report-type-option ${selectedReportType === type.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <i className={type.icon}></i>
                      <span>{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="config-card">
                <h4>Date Range</h4>
                <div className="date-range-options">
                  {dateRanges.map((range) => (
                    <label key={range.id} className="date-range-option">
                      <input 
                        type="radio" 
                        name="dateRange" 
                        value={range.id}
                        checked={dateRange === range.id}
                        onChange={(e) => setDateRange(e.target.value)}
                      />
                      <span>{range.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {dateRange === 'custom' && (
                <div className="config-card">
                  <h4>Custom Date Range</h4>
                  <div className="custom-date-inputs">
                    <div className="date-input-group">
                      <label>From:</label>
                      <input type="date" className="form-control" />
                    </div>
                    <div className="date-input-group">
                      <label>To:</label>
                      <input type="date" className="form-control" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="report-actions">
              <button className="btn btn-primary" onClick={generateReport}>
                <i className="bi bi-file-earmark-bar-graph"></i>
                Generate Report
              </button>
              <button className="btn btn-secondary" onClick={downloadReport}>
                <i className="bi bi-download"></i>
                Download Sample
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="reports-section">
            <div className="section-header">
              <h3>Recent Reports</h3>
            </div>
            
            <div className="recent-reports-grid">
              <div className="report-card">
                <div className="report-info">
                  <h4>Inventory Report</h4>
                  <p>Generated on Dec 15, 2024</p>
                  <span className="report-status completed">Completed</span>
                </div>
                <div className="report-actions">
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-eye"></i> View
                  </button>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-download"></i> Download
                  </button>
                </div>
              </div>

              <div className="report-card">
                <div className="report-info">
                  <h4>User Activity Report</h4>
                  <p>Generated on Dec 14, 2024</p>
                  <span className="report-status completed">Completed</span>
                </div>
                <div className="report-actions">
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-eye"></i> View
                  </button>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-download"></i> Download
                  </button>
                </div>
              </div>

              <div className="report-card">
                <div className="report-info">
                  <h4>Cost Analysis Report</h4>
                  <p>Generated on Dec 13, 2024</p>
                  <span className="report-status completed">Completed</span>
                </div>
                <div className="report-actions">
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-eye"></i> View
                  </button>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-download"></i> Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Statistics */}
          <div className="reports-section">
            <div className="section-header">
              <h3>Report Statistics</h3>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <h4>Total Reports</h4>
                  <div className="stat-value">156</div>
                </div>
                <i className="bi bi-file-earmark-text stat-icon"></i>
              </div>
              
              <div className="stat-card">
                <div className="stat-info">
                  <h4>This Month</h4>
                  <div className="stat-value">23</div>
                </div>
                <i className="bi bi-calendar-event stat-icon"></i>
              </div>
              
              <div className="stat-card">
                <div className="stat-info">
                  <h4>Downloads</h4>
                  <div className="stat-value">89</div>
                </div>
                <i className="bi bi-download stat-icon"></i>
              </div>
              
              <div className="stat-card">
                <div className="stat-info">
                  <h4>Storage Used</h4>
                  <div className="stat-value">2.4 GB</div>
                </div>
                <i className="bi bi-hdd stat-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
