import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'
import InventoryFormModal from '../components/InventoryFormModal'
import ItemDetailsModal from '../components/ItemDetailsModal'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { apiFetch } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { showNotification } from '../utils/notifications'

export default function Inventory() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [showQRScanner, setShowQRScanner] = useState(false)
  const scannerRef = React.useRef<any>(null)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  const [scannedData, setScannedData] = useState<any>(null)
  const [existingItem, setExistingItem] = useState<any>(null)
     // const [isCameraLoading, setIsCameraLoading] = useState(false)
   const [isSubmitting, setIsSubmitting] = useState(false)
   // Legacy scanner state removed; using Html5Qrcode via scannerRef
   

  
     // Form state for new item
   const [newItem, setNewItem] = useState({
     name: '',
     category: '',
     quantity: '',
     available: '',
     location: '',
     description: '',
     serialNumber: '',
     purchaseDate: '',
     purchasePrice: '',
     purchaseType: 'purchased',
     addedBy: '',
     status: 'Available',
     photo: ''
   })

  // Load inventory items from API
  useEffect(() => {
    loadInventoryItems()
  }, []) // Empty dependency array - only run once on mount

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.clear() } catch {}
        scannerRef.current = null
      }
      document.getElementById('inventory-qr-reader')?.replaceChildren()
      document.querySelectorAll('video').forEach((video) => {
        const mediaStream = (video as HTMLVideoElement).srcObject as MediaStream | null
        mediaStream?.getTracks().forEach((t) => t.stop())
      })
    }
  }, [])

  // Stop scanner when modals open
  useEffect(() => {
    if (showAddItemModal || showItemDetailsModal) {
      stopQRScanner()
    }
  }, [showAddItemModal, showItemDetailsModal])

  const loadInventoryItems = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory')
      if (response.ok) {
        const items = await response.json()
        // Map API response fields to frontend field names
        const mappedItems = items.map((item: any) => ({
          ...item,
          serialNumber: item.serial_number || item.serialNumber,
          name: item.name || item.item_name,
          category: item.category || item.item_category,
          location: item.location || item.item_location,
          description: item.description || item.item_description,
          quantity: item.quantity || item.item_quantity,
          available: item.available || item.item_available,
          status: item.status || item.item_status,
          photo: item.photo || item.item_photo
        }))
        setInventoryItems(mappedItems)
      }
    } catch (error) {
      console.error('Error loading inventory items:', error)
    }
  }

  
  
  // Inventory items state (loaded from API)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])

  const categories = ['All Categories', 'Electronics', 'Furniture', 'Office Supplies', 'Tools']

  const toggleItemExpansion = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'badge-success'
      case 'Low Stock':
        return 'badge-warning'
      case 'Out of Stock':
        return 'badge-danger'
      default:
        return 'badge-secondary'
    }
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const startQRScanner = () => {
    setShowQRScanner(true)
    setTimeout(() => {
      try {
        if (scannerRef.current) {
          try { scannerRef.current.clear() } catch {}
          scannerRef.current = null
        }
        const el = document.getElementById('inventory-qr-reader')
        if (el) el.innerHTML = ''
        const scanner = new Html5QrcodeScanner('inventory-qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false)
        scanner.render((decodedText: string) => {
          handleQRScan(decodedText)
          stopQRScanner()
        }, (_err: string) => {})
        scannerRef.current = scanner
      } catch (e) {
        console.error('Failed to start Html5QrcodeScanner', e)
      }
    }, 0)
  }

  const stopQRScanner = () => {
    try {
      if (scannerRef.current) {
        try { scannerRef.current.clear() } catch {}
        scannerRef.current = null
      }
    } finally {
      setShowQRScanner(false)
      document.getElementById('inventory-qr-reader')?.replaceChildren()
      document.querySelectorAll('video').forEach((video) => {
        const mediaStream = (video as HTMLVideoElement).srcObject as MediaStream | null
        mediaStream?.getTracks().forEach((t) => t.stop())
      })
    }
  }

  // Check if QR code already exists in database
  const checkQRExists = async (qrData: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/search?qr=${encodeURIComponent(qrData)}`)
      if (response.ok) {
        const result = await response.json()
        return result.exists ? result.item : null
      }
    } catch (error) {
      console.error('Error checking QR existence:', error)
    }
    return null
  }

  const handleQRScan = async (qrData: string) => {
    
    // First check if this QR code already exists
    const existingItem = await checkQRExists(qrData)
    
    if (existingItem) {
      // Item already exists - show details modal
      // Ensure the item has the correct field names for the modal
      const mappedItem = {
        ...existingItem,
        serialNumber: existingItem.serial_number || existingItem.serialNumber || qrData,
        scannedQRData: qrData, // Add the scanned QR data as fallback
        name: existingItem.name || existingItem.item_name,
        category: existingItem.category || existingItem.item_category,
        location: existingItem.location || existingItem.item_location,
        description: existingItem.description || existingItem.item_description,
        quantity: existingItem.quantity || existingItem.item_quantity,
        available: existingItem.available || existingItem.item_available,
        status: existingItem.status || existingItem.item_status,
        photo: existingItem.photo || existingItem.item_photo
      }
       setExistingItem(mappedItem)
       setShowItemDetailsModal(true)
    } else {
      // New item - parse QR data and show form
      try {
        const parts = qrData.split('-')
        if (parts.length >= 4 && parts[0] === 'ITEM') {
          const scannedItem = {
            id: parts[1],
            name: parts[2],
            category: parts[3],
            location: parts[4] || 'Unknown',
            description: 'Scanned from QR code',
            serialNumber: `QR-${parts[1]}`,
            purchaseDate: new Date().toISOString().split('T')[0],
            purchasePrice: 0,
            quantity: 1,
            available: 1,
            status: 'Available'
          }
          setScannedData(scannedItem)
          
                     setNewItem({
             name: scannedItem.name,
             category: scannedItem.category,
             quantity: '',
             available: '',
             location: scannedItem.location,
             description: '',
             serialNumber: scannedItem.serialNumber,
             purchaseDate: '',
             purchasePrice: '',
             purchaseType: 'purchased',
             addedBy: '',
             status: 'Available',
             photo: ''
           })
                                                                                                                                                                                                                                   // Show modal immediately
               setShowAddItemModal(true)
        } else {
           showNotification('Invalid QR code format. Please scan a valid inventory QR code.', 'error')
        }
      } catch (error) {
                 console.error('Error parsing QR data:', error)
         showNotification('Error processing QR code. Please try again.', 'error')
      }
    }
  }





  const handleEditItem = (item: any) => {
    
    // Ensure QR scanner is completely stopped first
    stopQRScanner()
    
    // Set both editingItem and existingItem for the modal
    setEditingItem(item)
    setExistingItem(item)
    setIsEditMode(true)
    setShowItemDetailsModal(true)
    
  }

  const handleUpdateItem = async (itemData: any) => {
    setIsSubmitting(true)
    
    try {
      // Simple approach - always use JSON like the working backup
      const updateData = {
        name: itemData.name || editingItem.name,
        category: itemData.category || editingItem.category,
        quantity: parseInt(itemData.quantity) || editingItem.quantity || 1,
        available: parseInt(itemData.available) || editingItem.available || 1,
        location: itemData.location || editingItem.location,
        description: itemData.description || editingItem.description,
        serial_number: itemData.serialNumber || editingItem.serialNumber,
        purchase_date: itemData.purchaseDate || editingItem.purchaseDate,
        purchase_price: parseFloat(itemData.purchasePrice) || editingItem.purchasePrice || 0,
        purchase_type: itemData.purchaseType || editingItem.purchaseType || 'purchased',
        added_by: itemData.addedBy || editingItem.addedBy || 'Admin User',
        status: itemData.status || editingItem.status || 'Available',
        photo: itemData.photo || editingItem.photo
      }
      
      
      const response = await apiFetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        
        // Update the item in the inventory list
        setInventoryItems(prevItems => prevItems.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ))
        
        // Close modal and show success message
        closeModal()
        showNotification('Item updated successfully!', 'success')
      } else {
        const errorData = await response.json()
        showNotification(`Error updating item: ${errorData.message || 'Unknown error'}`, 'error')
      }
      
    } catch (error) {
      console.error('Error updating item:', error)
      showNotification('Error updating item. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitItemFromModal = async (itemData: any) => {
    setIsSubmitting(true)
    
    try {
      const response = await apiFetch('/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
           name: itemData.name,
           category: itemData.category,
           quantity: parseInt(itemData.quantity) || 1,
           available: parseInt(itemData.available) || 1,
           location: itemData.location,
           description: itemData.description,
           serial_number: itemData.serialNumber,
           purchase_date: itemData.purchaseDate,
           purchase_price: parseFloat(itemData.purchasePrice) || 0,
           purchase_type: itemData.purchaseType || 'purchased',
           added_by: itemData.addedBy || 'Admin User',
           status: itemData.status || 'Available',
           photo: itemData.photo
         })
      })

      if (response.ok) {
        const newItem = await response.json()
        
        // Add the new item to the inventory list
        setInventoryItems(prevItems => [...prevItems, newItem])
        
        // Close modal and show success message
        closeModal()
        showNotification('Item added successfully!', 'success')
        
        // Reset form
        setNewItem({
          name: '',
          category: '',
          quantity: '',
          available: '',
          location: '',
          description: '',
          serialNumber: '',
          purchaseDate: '',
          purchasePrice: '',
          purchaseType: 'purchased',
          addedBy: '',
          status: 'Available',
          photo: ''
        })
      } else {
        const errorData = await response.json()
        console.error('Backend error response:', errorData)
        console.error('Response status:', response.status)
        showNotification(`Error adding item: ${errorData.message || 'Unknown error'}`, 'error')
      }
      
    } catch (error) {
      console.error('Error adding item:', error)
      showNotification('Error adding item. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

     const closeModal = () => {
     
     // Close modals first
     setShowAddItemModal(false)
     setShowItemDetailsModal(false)
     
          // Reset all related states
      setScannedData(null)
      setExistingItem(null)
      setEditingItem(null)
      setIsEditMode(false)
      setIsSubmitting(false)
     
     // Ensure QR scanner is completely stopped
     stopQRScanner()
     
     // Reset form to empty state, not default values
     setNewItem({
       name: '',
       category: '',
       quantity: '',
       available: '',
       location: '',
       description: '',
       serialNumber: '',
       purchaseDate: '',
       purchasePrice: '',
       purchaseType: 'purchased',
       addedBy: '',
       status: 'Available',
       photo: ''
     })
     
   }

     const addItemButton = (
     <button 
       className="add-item-btn"
       onClick={startQRScanner}
     >
       <i className="bi bi-qr-code-scan"></i> Scan QR Code
     </button>
   )

  const handleDeleteItem = async (itemId: number, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      try {
        const response = await apiFetch(`/api/inventory/${itemId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Remove item from local state
          setInventoryItems(prevItems => prevItems.filter(item => item.id !== itemId))
          showNotification('Item deleted successfully!', 'success')
        } else {
          const errorData = await response.json()
          showNotification(`Error deleting item: ${errorData.message || 'Unknown error'}`, 'error')
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        showNotification('Error deleting item. Please try again.', 'error')
      }
    }
  }


  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <AdminTopBar 
          searchPlaceholder="Search inventory..." 
          currentUser={user || { name: '', role: 'ADMIN' }}
          rightContent={addItemButton}
        />
        
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Inventory Management</h1>
            <p className="dashboard-subtitle">Track and manage all your property inventory items</p>
          </div>

          {/* Inventory Overview Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-info">
                <h3>Total Items</h3>
                <div className="kpi-value">{inventoryItems.length}</div>
              </div>
              <i className="bi bi-box kpi-icon"></i>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-info">
                <h3>Available Items</h3>
                <div className="kpi-value">{inventoryItems.reduce((sum, item) => sum + item.available, 0)}</div>
              </div>
              <i className="bi bi-check-circle kpi-icon"></i>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-info">
                <h3>Categories</h3>
                <div className="kpi-value">{categories.length - 1}</div>
              </div>
              <i className="bi bi-tags kpi-icon"></i>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-info">
                <h3>Total Value</h3>
                <div className="kpi-value">₱{inventoryItems.reduce((sum, item) => {
                  const value = item.purchaseType === 'donated' ? 0 : (item.purchasePrice * item.quantity)
                  return sum + value
                }, 0).toLocaleString()}</div>
              </div>
              <i className="bi bi-currency-dollar kpi-icon"></i>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="inventory-section">
            <div className="section-header">
              <h3>All Inventory Items</h3>
              <select 
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th>Item ID</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <i className="bi bi-box" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                        <p className="mt-2 text-muted">No items found</p>
                        <p className="text-muted">Click "Scan QR Code" to add your first inventory item</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr 
                          className={expandedItems.has(item.id) ? 'expanded-row' : ''}
                          onClick={() => toggleItemExpansion(item.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <i className={`bi ${expandedItems.has(item.id) ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                          </td>
                          <td>
                            <span className="item-id">#{String(item.id).padStart(3, '0')}</span>
                          </td>
                          <td>
                            <div className="item-info-cell">
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{item.available}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="action-btn-edit"
                                onClick={() => handleEditItem(item)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="action-btn-delete"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedItems.has(item.id) && (
                          <tr className="expanded-details">
                            <td colSpan={8}>
                              <div className="item-details-grid">
                                <div className="item-info-section">
                                  <div className="info-row">
                                    <div className="detail-item">
                                      <label>ITEM NAME:</label>
                                      <span>{item.name}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>AVAILABLE:</label>
                                      <span>{item.available}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>DESCRIPTION:</label>
                                      <span>{item.description || 'No description available'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="info-row">
                                    <div className="detail-item">
                                      <label>CATEGORY:</label>
                                      <span>{item.category}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>LOCATION:</label>
                                      <span>{item.location}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>STATUS:</label>
                                      <span>{item.status}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="info-row">
                                    <div className="detail-item">
                                      <label>QUANTITY:</label>
                                      <span>{item.quantity}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>PURCHASE TYPE:</label>
                                      <span>{item.purchaseType === 'donated' ? 'Donated' : 'School Purchased'}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>PURCHASE DATE:</label>
                                      <span>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Not specified'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="info-row">
                                    <div className="detail-item">
                                      <label>PURCHASE PRICE:</label>
                                      <span>{item.purchaseType === 'donated' ? 'N/A (Donated)' : `₱${item.purchasePrice ? Number(item.purchasePrice).toLocaleString() : '0'}`}</span>
                                    </div>
                                    <div className="detail-item">
                                      <label>ADDED BY:</label>
                                      <span>{item.addedBy || 'Not specified'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="item-photo-qr-section">
                                  <div className="photo-upload-area">
                                    <label>ITEM PHOTO:</label>
                                    <div className="photo-display">
                                      {item.photo ? (
                                        <img 
                                          src={item.photo}
                                          alt={item.name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.nextElementSibling?.classList.remove('d-none')
                                          }}
                                        />
                                      ) : (
                                        <div className="photo-placeholder">
                                          <i className="bi bi-image" style={{ fontSize: '24px', color: '#cbd5e1' }}></i>
                                          <span>No Image</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="qr-code-display">
                                    <label>QR CODE:</label>
                                    <div className="qr-image-container">
                                      {item.serialNumber ? (
                                        <img 
                                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.serialNumber)}`}
                                          alt="QR Code"
                                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.nextElementSibling?.classList.remove('d-none')
                                          }}
                                        />
                                      ) : (
                                        <div className="qr-placeholder">
                                          <i className="bi bi-qr-code" style={{ fontSize: '24px', color: '#cbd5e1' }}></i>
                                          <span>No QR Code</span>
                                        </div>
                                      )}
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
        </div>
      </main>

      {/* QR Scanner Modal (original layout) */}
      {showQRScanner && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Scan QR Code</h5>
                <button type="button" className="btn-close" onClick={stopQRScanner}></button>
              </div>
              <div className="modal-body">
                <div id="inventory-qr-reader" style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Add Item Modal */}
                       <InventoryFormModal
           isOpen={showAddItemModal}
           onClose={closeModal}
           onSubmit={handleSubmitItemFromModal}
           scannedData={scannedData}
           isSubmitting={isSubmitting}
           newItem={newItem}
           onInputChange={(field: string, value: any) => {
             setNewItem(prev => ({
               ...prev,
               [field]: value
             }))
           }}
           isReadOnlyFromScan={true}
         />

      {/* Item Details Modal */}
              <ItemDetailsModal
          isOpen={showItemDetailsModal}
          onClose={closeModal}
          existingItem={isEditMode ? editingItem : existingItem}
          scannedQRData={scannedData?.serialNumber}
          isEditMode={isEditMode}
          onEdit={() => {
            // Use the current item being displayed in the modal
            const currentItem = isEditMode ? editingItem : existingItem
            setEditingItem(currentItem)
            setIsEditMode(true)
          }}
          onSave={handleUpdateItem}
          isSubmitting={isSubmitting}
          onCancelEdit={() => setIsEditMode(false)}
        />
    </div>
  )
}
