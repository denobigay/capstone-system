import React from 'react'

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (itemData: any) => void
  scannedData: any
  isSubmitting: boolean
  newItem: any
  onInputChange: (field: string, value: any) => void
  isReadOnlyFromScan: boolean
  isFormLoading?: boolean
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  scannedData,
  isSubmitting,
  newItem,
  onInputChange,
  isReadOnlyFromScan,
  isFormLoading = false
}: InventoryFormModalProps) {
  
  
  if (!isOpen) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newItem.name || !newItem.category || !newItem.location || !newItem.quantity || !newItem.available) {
      alert('Please fill in all required fields (Name, Category, Location, Quantity, Available)')
      return
    }
    
    onSubmit(newItem)
  }
  
  const handleClose = () => {
    onClose()
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div 
       style={{
         position: 'fixed',
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         backgroundColor: 'rgba(0, 0, 0, 0.5)',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         zIndex: 9999
       }}
       onClick={handleClose}
     >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Screen */}
        {isFormLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '500',
                color: '#495057',
                textAlign: 'center'
              }}>
                <div>Closing QR Scanner...</div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  Please wait while we prepare the form
                </div>
              </div>
            </div>
          </div>
        )}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{ margin: 0, fontWeight: 'bold' }}>
            {scannedData ? 'Add Scanned Item' : 'Add Inventory Item'}
          </h5>
                     <button 
             type="button" 
             onClick={handleClose}
             style={{
               background: 'none',
               border: 'none',
               fontSize: '1.5rem',
               cursor: 'pointer',
               padding: '0',
               width: '30px',
               height: '30px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}
           >
             ×
           </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1rem' }}>
            {scannedData && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>✓</span>
                <span>QR code scanned successfully! Please review and complete the item details.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Item Name *
                </label>
                <input 
                  type="text" 
                  value={newItem.name || ''}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  disabled={isReadOnlyFromScan}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Category *
                </label>
                <select 
                  value={newItem.category || ''}
                  onChange={(e) => onInputChange('category', e.target.value)}
                  disabled={isReadOnlyFromScan}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Tools">Tools</option>
                  <option value="Books">Books</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                  <option value="Laboratory Equipment">Laboratory Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Quantity *
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={newItem.quantity || ''}
                  onChange={(e) => onInputChange('quantity', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Available
                </label>
                <input 
                  type="number" 
                  min="0"
                  max={newItem.quantity || 1}
                  value={newItem.available || ''}
                  onChange={(e) => onInputChange('available', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Location *
                </label>
                <input 
                  type="text" 
                  value={newItem.location || ''}
                  onChange={(e) => onInputChange('location', e.target.value)}
                  disabled={isReadOnlyFromScan}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>

              {/* Serial number input removed; QR image shown near photo uploader below */}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Remarks
                </label>
                <select 
                  value={newItem.purchaseType || 'purchased'}
                  onChange={(e) => onInputChange('purchaseType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                >
                  <option value="purchased">School Purchased</option>
                  <option value="donated">Donated</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Purchase Price
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={newItem.purchasePrice || ''}
                  onChange={(e) => onInputChange('purchasePrice', e.target.value)}
                  disabled={newItem.purchaseType === 'donated'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: newItem.purchaseType === 'donated' ? '#e9ecef' : '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Purchase Date
                </label>
                <input 
                  type="date" 
                  value={newItem.purchaseDate || ''}
                  onChange={(e) => onInputChange('purchaseDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#212529'
                  }}
                />
              </div>


            <div style={{ gridColumn: '1 / -1' }}>
              {/* Item Photo & QR Code Section - Title above all three columns */}
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Item Photo & QR Code
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr', // 3 columns: description (wider), photo upload, QR code
                gap: '1rem',
                alignItems: 'start'
              }}>
                {/* Description/Comment Area - Left Side (Wider) */}
                <div style={{
                  border: '2px solid #ced4da',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  height: '160px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Description
                  </label>
                  <textarea
                    value={newItem.description || ''}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Enter additional description or comments..."
                    style={{
                      flex: 1,
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      resize: 'none',
                      backgroundColor: '#ffffff',
                      color: '#212529'
                    }}
                  />
                </div>

                {/* Photo Upload Area - Middle */}
                <div style={{
                  border: '2px dashed #ced4da',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff'
                  e.currentTarget.style.backgroundColor = '#e7f3ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ced4da'
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                }}
                onClick={() => document.getElementById('item-photo-upload')?.click()}
                >
                  {newItem.photo ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={newItem.photo}
                        alt="Item preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '4px',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onInputChange('photo', '')
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-camera" style={{ fontSize: '1.5rem', color: '#6c757d', marginBottom: '0.5rem' }}></i>
                      <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.8rem' }}>Click to upload</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#adb5bd' }}>JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* QR Code Display - Right Side */}
                <div style={{
                  width: '100%',
                  height: '160px',
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  padding: '0.5rem'
                }}>
                  {(() => {
                    // Generate QR code data - use serial number if available, otherwise use item details
                    const qrData = newItem.serialNumber || `ITEM-${Date.now()}-${newItem.name || 'New Item'}-${newItem.category || 'General'}-${newItem.location || 'Unknown'}`
                    return (
                      <div style={{ width: '100%', height: '100%' }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`}
                          alt="QR Code"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            console.error('QR image failed to load:', e)
                          }}
                        />
                      </div>
                    )
                  })()}
                </div>
              </div>

                {/* Keep serial number in state but hide the field */}
                <input type="hidden" value={newItem.serialNumber || ''} readOnly />
                <input
                  id="item-photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        onInputChange('photo', e.target?.result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
                     <button 
               type="button" 
               onClick={handleClose}
               style={{
                 padding: '0.5rem 1rem',
                 border: '1px solid #6c757d',
                 backgroundColor: '#6c757d',
                 color: 'white',
                 borderRadius: '4px',
                 cursor: 'pointer',
                 fontSize: '1rem'
               }}
             >
               Cancel
             </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #007bff',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Adding Item...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
