
import { useState } from 'react'
import QRCode from 'qrcode'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

export default function QRGenerator() {
  const { user: currentUser } = useAuth()
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [generatedQR, setGeneratedQR] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const categories = [
    'Electronics',
    'Furniture', 
    'Office Supplies',
    'Tools',
    'Books',
    'Sports Equipment',
    'Laboratory Equipment',
    'Other'
  ]


  const generateQR = async () => {
    if (!itemName.trim() || !itemCategory) {
      alert('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    
    try {
      // Create a structured data string for QR code
      const dataString = `ITEM-${Date.now()}-${itemName}-${itemCategory}`
      
      // Generate real QR code using qrcode library
      const qrDataURL = await QRCode.toDataURL(dataString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      const newQR = {
        id: Date.now(),
        itemName,
        itemCategory,
        timestamp: new Date().toISOString(),
        qrData: dataString,
        qrCode: qrDataURL
      }

      setGeneratedQR(newQR)

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
        <span>QR Code generated successfully!</span>
        <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Error generating QR code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }



  const downloadQR = () => {
    if (!generatedQR || !generatedQR.qrCode) return
    
    try {
      // Download the QR code as PNG image
      const link = document.createElement('a')
      link.download = `qr-${generatedQR.itemName || 'item'}.png`
      link.href = generatedQR.qrCode
      link.click()
      
    } catch (error) {
      console.error('Error downloading QR image:', error)
      alert('Error downloading QR code. Please try again.')
    }
    
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
        <span>QR Code download started...</span>
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

  const printQR = () => {
    if (!generatedQR) return
    
    // In a real application, you would print the QR code
    
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
        <i class="bi bi-printer me-2"></i>
        <span>Printing QR code...</span>
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
          searchPlaceholder="Search QR codes..." 
          currentUser={currentUser ? { name: currentUser.name, role: currentUser.role } : undefined}
        />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">QR Code Generator</h1>
            <p className="dashboard-subtitle">Generate QR codes for school inventory items</p>
          </div>

          {/* Main QR Generator Section */}
          <div className="qr-generator-main">
            <div className="qr-generator-grid">
              {/* Left Column - Form */}
              <div className="qr-form-section">
                <div className="qr-form-card">
                  <h3>Step 1: Enter Item Details</h3>
                  <div className="qr-form">
                    <div className="form-group">
                      <label>Item Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter item name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Item Category</label>
                      <select 
                        className="form-select"
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    
                    <button 
                      className="btn btn-primary generate-btn"
                      onClick={generateQR}
                      disabled={!itemName.trim() || !itemCategory || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        'Generate QR Code'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Display */}
              <div className="qr-display-section">
                <div className="qr-display-card">
                  <h3>Generated QR Code</h3>
                  <div className="qr-display-area">
                    {generatedQR ? (
                      <div className="qr-code-generated">
                                                 <div className="qr-code-image">
                           <img 
                             src={generatedQR.qrCode}
                             alt="Generated QR Code"
                             style={{ 
                               width: '200px', 
                               height: '200px', 
                               border: '2px solid #e9ecef',
                               borderRadius: '8px',
                               backgroundColor: 'white',
                               margin: '0 auto',
                               display: 'block'
                             }}
                           />
                         </div>
                        <div className="qr-item-info">
                          <p><strong>Item:</strong> {generatedQR.itemName}</p>
                          <p><strong>Category:</strong> {generatedQR.itemCategory}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="qr-placeholder">
                        <div style={{ 
                          width: '200px', 
                          height: '200px', 
                          border: '2px dashed #e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          fontSize: '14px',
                          color: '#6c757d',
                          textAlign: 'center',
                          margin: '0 auto',
                          padding: '20px'
                        }}>
                          Enter item details and click generate to create QR code
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="qr-actions">
                    <button 
                      className="btn btn-outline-secondary action-btn"
                      onClick={downloadQR}
                      disabled={!generatedQR}
                    >
                      Download QR Code
                    </button>
                    <button 
                      className="btn btn-outline-secondary action-btn"
                      onClick={printQR}
                      disabled={!generatedQR}
                    >
                      Print QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* How to Use QR Codes Section */}
          <div className="qr-usage-section">
            <h3>How to Use QR Codes</h3>
            <div className="usage-steps-grid">
              <div className="usage-step-card">
                <div className="step-icon">
                  <i className="bi bi-qr-code"></i>
                </div>
                <h4>Generate QR Code</h4>
                <p>Enter the item name and select category, then generate a unique QR code for each item.</p>
              </div>
              
              <div className="usage-step-card">
                <div className="step-icon">
                  <i className="bi bi-printer"></i>
                </div>
                <h4>Print & Attach</h4>
                <p>Download and print the QR code, then attach it to the physical item.</p>
              </div>
              
              <div className="usage-step-card">
                <div className="step-icon">
                  <i className="bi bi-phone"></i>
                </div>
                <h4>Scan & Update</h4>
                <p>Scan the QR code to access detailed item information and update records.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
