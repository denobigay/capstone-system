import { useState, useEffect } from 'react'

interface ItemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  existingItem: any
  scannedQRData?: string // Add this to pass the scanned QR data
  isEditMode?: boolean
  onEdit?: () => void
  onSave?: (itemData: any) => void
  isSubmitting?: boolean
  onCancelEdit?: () => void
}

export default function ItemDetailsModal({
  isOpen,
  onClose,
  existingItem,
  isEditMode = false,
  onEdit,
  onSave,
  isSubmitting = false
}: ItemDetailsModalProps) {
  
  
  const [editForm, setEditForm] = useState({
    name: existingItem?.name || '',
    category: existingItem?.category || '',
    quantity: existingItem?.quantity || '',
    available: existingItem?.available || '',
    location: existingItem?.location || '',
    description: existingItem?.description || '',
    serialNumber: existingItem?.serial_number || '',
    purchaseDate: existingItem?.purchase_date ? existingItem.purchase_date.split('T')[0] : '',
    purchasePrice: existingItem?.purchase_price || '',
    purchaseType: existingItem?.purchase_type || 'purchased',
    addedBy: existingItem?.added_by || '',
    status: existingItem?.status || 'Available',
    photo: existingItem?.photo || ''
  })

  // Update form when existingItem changes or when entering edit mode
  useEffect(() => {
    if (existingItem) {
      setEditForm({
        name: existingItem.name || '',
        category: existingItem.category || '',
        quantity: existingItem.quantity || '',
        available: existingItem.available || '',
        location: existingItem.location || '',
        description: existingItem.description || '',
        serialNumber: existingItem.serial_number || '',
        purchaseDate: existingItem.purchase_date ? existingItem.purchase_date.split('T')[0] : '',
        purchasePrice: existingItem.purchase_price || '',
        purchaseType: existingItem.purchase_type || 'purchased',
        addedBy: existingItem.added_by || '',
        status: existingItem.status || 'Available',
        photo: existingItem.photo || ''
      })
    }
  }, [existingItem])

  // Initialize form when entering edit mode
  useEffect(() => {
    if (isEditMode && existingItem) {
      const formData = {
        name: existingItem.name || '',
        category: existingItem.category || '',
        quantity: existingItem.quantity || '',
        available: existingItem.available || '',
        location: existingItem.location || '',
        description: existingItem.description || '',
        serialNumber: existingItem.serial_number || '',
        purchaseDate: existingItem.purchase_date ? existingItem.purchase_date.split('T')[0] : '',
        purchasePrice: existingItem.purchase_price || '',
        purchaseType: existingItem.purchase_type || 'purchased',
        addedBy: existingItem.added_by || '',
        status: existingItem.status || 'Available',
        photo: existingItem.photo || ''
      }
      setEditForm(formData)
    }
  }, [isEditMode, existingItem])

  const handleInputChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (onSave) {
      // Ensure all required fields have values, using original values if not changed
      const completeFormData = {
        name: editForm.name || existingItem.name || '',
        category: editForm.category || existingItem.category || '',
        quantity: editForm.quantity || existingItem.quantity || '',
        available: editForm.available || existingItem.available || '',
        location: editForm.location || existingItem.location || '',
        description: editForm.description || existingItem.description || '',
        serialNumber: editForm.serialNumber || existingItem.serialNumber || '',
        purchaseDate: editForm.purchaseDate || existingItem.purchaseDate || '',
        purchasePrice: editForm.purchasePrice || existingItem.purchasePrice || '',
        purchaseType: editForm.purchaseType || existingItem.purchaseType || 'purchased',
        addedBy: editForm.addedBy || existingItem.addedBy || '',
        status: editForm.status || existingItem.status || 'Available',
        photo: editForm.photo || existingItem.photo || ''
      }
      
      onSave(completeFormData)
    }
  }
  
  if (!isOpen || !existingItem) return null

     return (
     <>
       <style>
         {`
           .edit-input::placeholder {
             color: #6c757d !important;
             opacity: 1 !important;
           }
           .edit-input::-webkit-input-placeholder {
             color: #6c757d !important;
             opacity: 1 !important;
           }
           .edit-input::-moz-placeholder {
             color: #6c757d !important;
             opacity: 1 !important;
           }
                       .edit-input:-ms-input-placeholder {
              color: #6c757d !important;
              opacity: 1 !important;
            }
            .edit-input {
              color: #495057 !important;
            }
            .item-details-modal input, 
            .item-details-modal select, 
            .item-details-modal textarea {
              color: #495057 !important;
            }
            .item-details-modal input:disabled, 
            .item-details-modal select:disabled, 
            .item-details-modal textarea:disabled {
              color: #6c757d !important;
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
         onClick={onClose}
       >
             <div 
         className="item-details-modal"
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
                 <div style={{
           padding: '1rem',
           borderBottom: '1px solid #dee2e6',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center'
         }}>
           <h5 style={{ margin: 0, fontWeight: 'bold' }}>
             {isEditMode ? 'Edit Item' : 'Item Details'}
           </h5>
           <button 
             type="button" 
             onClick={onClose}
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

        <div style={{ padding: '1rem' }}>
          {!isEditMode && (
            <div style={{
              backgroundColor: '#d1ecf1',
              color: '#0c5460',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>ℹ</span>
              <span>This item already exists in the system.</span>
            </div>
          )}

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Item Name
              </label>
                                                           <input 
                  type="text" 
                  value={isEditMode ? editForm.name : (existingItem.name || '')}
                  onChange={(e) => isEditMode && handleInputChange('name', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={isEditMode ? `Original: ${existingItem.name || 'Not specified'}` : ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                  }}
                  className={isEditMode ? 'edit-input' : ''}
                />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Category
              </label>
                                                           <input 
                  type="text" 
                  value={isEditMode ? editForm.category : (existingItem.category || '')}
                  onChange={(e) => isEditMode && handleInputChange('category', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={isEditMode ? `Original: ${existingItem.category || 'Not specified'}` : ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                  }}
                  className={isEditMode ? 'edit-input' : ''}
                />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Quantity
              </label>
                                                           <input 
                  type="number" 
                  value={isEditMode ? editForm.quantity : (existingItem.quantity || 0)}
                  onChange={(e) => isEditMode && handleInputChange('quantity', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={isEditMode ? `Original: ${existingItem.quantity || '0'}` : ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                  }}
                  className={isEditMode ? 'edit-input' : ''}
                />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Available
              </label>
                                                           <input 
                  type="number" 
                  value={isEditMode ? editForm.available : (existingItem.available || 0)}
                  onChange={(e) => isEditMode && handleInputChange('available', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={isEditMode ? `Original: ${existingItem.available || '0'}` : ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                  }}
                  className={isEditMode ? 'edit-input' : ''}
                />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Location
              </label>
                                                           <input 
                  type="text" 
                  value={isEditMode ? editForm.location : (existingItem.location || '')}
                  onChange={(e) => isEditMode && handleInputChange('location', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={isEditMode ? `Original: ${existingItem.location || 'Not specified'}` : ''}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                  }}
                  className={isEditMode ? 'edit-input' : ''}
                />
            </div>

                         <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                 Status
               </label>
                                                               <input 
                   type="text" 
                   value={isEditMode ? editForm.status : (existingItem.status || '')}
                   onChange={(e) => isEditMode && handleInputChange('status', e.target.value)}
                   disabled={!isEditMode}
                   placeholder={isEditMode ? `Original: ${existingItem.status || 'Not specified'}` : ''}
                   style={{
                     width: '100%',
                     padding: '0.5rem',
                     border: '1px solid #ced4da',
                     borderRadius: '4px',
                     fontSize: '1rem',
                     backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                   }}
                   className={isEditMode ? 'edit-input' : ''}
                 />
             </div>

             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                 Remarks
               </label>
               <select 
                 value={isEditMode ? editForm.purchaseType : (existingItem.purchaseType || 'purchased')}
                 onChange={(e) => isEditMode && handleInputChange('purchaseType', e.target.value)}
                 disabled={!isEditMode}
                 style={{
                   width: '100%',
                   padding: '0.5rem',
                   border: '1px solid #ced4da',
                   borderRadius: '4px',
                   fontSize: '1rem',
                   backgroundColor: isEditMode ? 'white' : '#f8f9fa',
                   color: '#212529'
                 }}
                 title={isEditMode ? `Original: ${existingItem.purchaseType === 'donated' ? 'Donated' : 'School Purchased'}` : ''}
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
                   value={isEditMode ? editForm.purchasePrice : (existingItem.purchasePrice || '')}
                   onChange={(e) => isEditMode && handleInputChange('purchasePrice', e.target.value)}
                   disabled={!isEditMode || (existingItem.purchaseType === 'donated')}
                   placeholder={isEditMode ? `Original: ${existingItem.purchaseType === 'donated' ? 'N/A (Donated)' : (existingItem.purchasePrice || '0')}` : ''}
                   style={{
                     width: '100%',
                     padding: '0.5rem',
                     border: '1px solid #ced4da',
                     borderRadius: '4px',
                     fontSize: '1rem',
                     backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                   }}
                   className={isEditMode ? 'edit-input' : ''}
                 />
             </div>

             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                 Purchase Date
               </label>
                                                               <input 
                   type="date" 
                   value={isEditMode ? editForm.purchaseDate : (existingItem.purchaseDate || '')}
                   onChange={(e) => isEditMode && handleInputChange('purchaseDate', e.target.value)}
                   disabled={!isEditMode}
                   placeholder={isEditMode ? `Original: ${existingItem.purchaseDate || 'Not specified'}` : ''}
                   style={{
                     width: '100%',
                     padding: '0.5rem',
                     border: '1px solid #ced4da',
                     borderRadius: '4px',
                     fontSize: '1rem',
                     backgroundColor: isEditMode ? 'white' : '#f8f9fa'
                   }}
                   className={isEditMode ? 'edit-input' : ''}
                 />
             </div>


            {/* Item Photo & QR Code Section - Title above all three columns */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Item Photo & QR Code
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', // 3 columns: description (wider), photo display, QR code
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
                  {isEditMode ? (
                                                                                   <textarea
                        value={editForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        style={{
                          flex: 1,
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          fontSize: '0.9rem',
                          resize: 'none',
                          fontFamily: 'inherit'
                        }}
                        placeholder={`Original: ${existingItem.description || 'No description available'}`}
                        className="edit-input"
                      />
                  ) : (
                    <div style={{
                      flex: 1,
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      fontSize: '0.9rem',
                      overflow: 'auto'
                    }}>
                      {existingItem.description || 'No description available'}
                    </div>
                  )}
                </div>

                {/* Photo Display/Upload Area - Middle */}
                <div style={{ 
                  border: '2px solid #ced4da',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  textAlign: 'center',
                  height: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isEditMode ? (
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              const result = e.target?.result as string
                              handleInputChange('photo', result)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.8rem' }}>Upload new photo</p>
                    </div>
                  ) : (
                    (existingItem.photo || editForm.photo) ? (
                      <>
                        <img 
                          src={(() => {
                            const photo = existingItem.photo || editForm.photo
                            
                            // If it's a base64 string, use it directly
                            if (photo.startsWith('data:image/')) {
                              return photo
                            }
                            // If it's a file path, construct the full URL
                            if (photo && !photo.startsWith('http')) {
                              return `http://127.0.0.1:8000/${photo}`
                            }
                            // If it's already a full URL, use it
                            return photo
                          })()}
                          alt="Item photo" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '4px',
                            objectFit: 'cover'
                          }} 
                          onError={(e) => {
                            console.error('Image failed to load:', e)
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('d-none')
                          }}
                        />
                        <div className="d-none" style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6c757d'
                        }}>
                          <i className="bi bi-image" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>Image failed to load</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <i className="bi bi-image" style={{ fontSize: '1.5rem', color: '#6c757d', marginBottom: '0.5rem' }}></i>
                        <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.8rem' }}>No photo available</p>
                      </div>
                    )
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
                    // Always generate QR code with item details
                    const qrData = `ITEM-${existingItem.id}-${existingItem.name}-${existingItem.category}-${existingItem.location}`
                    return (
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
                        onLoad={() => {
                        }}
                      />
                    )
                  })()}
                </div>
              </div>
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
           {isEditMode && onSave && (
             <button
               type="button"
               onClick={handleSave}
               disabled={isSubmitting}
               style={{
                 background: '#28a745',
                 color: 'white',
                 border: 'none',
                 padding: '0.5rem 1rem',
                 borderRadius: '4px',
                 cursor: isSubmitting ? 'not-allowed' : 'pointer',
                 fontSize: '1rem',
                 opacity: isSubmitting ? 0.6 : 1
               }}
             >
               {isSubmitting ? 'Saving...' : 'Save'}
             </button>
           )}
           <button 
             type="button" 
             onClick={onClose}
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
             Close
           </button>
           {!isEditMode && onEdit && (
             <button 
               type="button"
               onClick={() => {
                 onEdit()
               }}
               style={{
                 padding: '0.5rem 1rem',
                 border: '1px solid #007bff',
                 backgroundColor: '#007bff',
                 color: 'white',
                 borderRadius: '4px',
                 cursor: 'pointer',
                 fontSize: '1rem'
               }}
             >
               Edit Item
             </button>
           )}
                  </div>
       </div>
     </div>
     </>
   )
 }
