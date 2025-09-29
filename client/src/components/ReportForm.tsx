import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

interface ReportFormProps {
  currentUser: { role: string; name: string }
  onRequestSubmit: (requests: any[]) => Promise<void>
}

const ReportForm: React.FC<ReportFormProps> = ({ currentUser, onRequestSubmit }) => {
  const [teacherItems, setTeacherItems] = useState<Array<{ id: string, name: string, assigned: number }>>([])
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [reportType, setReportType] = useState('missing')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState<number>(1)

  // Load teacher's assigned items
  useEffect(() => {
    const loadTeacherItems = async () => {
      try {
        const response = await apiFetch(`/api/requests/teacher-assigned?teacher_name=${encodeURIComponent(currentUser.name)}`)
        if (response.ok) {
          const items = await response.json()
          setTeacherItems(items)
        } else {
          setTeacherItems([])
        }
      } catch (err) {
        setTeacherItems([])
      }
    }
    
    if (currentUser?.name) {
      loadTeacherItems()
    }
  }, [currentUser?.name])

  const handleItemSelection = (itemId: string) => {
    setSelectedItem(itemId)
    // Reset quantity to 1 when selecting a new item
    setQuantity(1)
  }

  const submitReport = async () => {
    try {
      if (!selectedItem) {
        alert('Please select an item to report.')
        return
      }

      // Description is now optional

      if (!location.trim()) {
        alert('Please enter a location.')
        return
      }

      const selectedItemData = teacherItems.find(item => item.id === selectedItem)
      const itemName = selectedItemData?.name || 'Unknown Item'

      // Check if quantity doesn't exceed assigned amount
      if (quantity > (selectedItemData?.assigned || 0)) {
        alert(`Quantity cannot exceed assigned amount (${selectedItemData?.assigned || 0}).`)
        return
      }

      // Map report type to the format expected by admin table
      const reportTypeMapping = {
        'missing': 'MISSING',
        'damaged': 'DAMAGED', 
        'other': 'OTHER'
      }

      const mappedReportType = reportTypeMapping[reportType as keyof typeof reportTypeMapping]

      const payload = {
        teacher_name: currentUser.name,
        teacher_id: currentUser.id,
        location: location.trim(),
        subject: null, // Remove subject field
        description: `${itemName} (Qty: ${quantity})${description.trim() ? ` - ${description.trim()}` : ''}`,
        notes: `REPORT: ${mappedReportType} - Item: ${itemName} - Quantity: ${quantity} - ${description}`,
        photo: null // Can add photo upload later if needed
      }

      const res = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        let errorMessage = 'Failed to submit report'
        try {
          const errorData = await res.json()
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat()
            errorMessage = errorMessages.join(', ')
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          const errorText = await res.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      alert('Report submitted successfully!')
      
      // Reset form
      setSelectedItem('')
      setDescription('')
      setLocation('')
      setQuantity(1)
      
      // Call parent callback if provided
      if (onRequestSubmit) {
        await onRequestSubmit([])
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit report')
    }
  }

  return (
    <div className="request-status-card" style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div className="card-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '20px' }}></i>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Report</h4>
        </div>
      </div>
      
      <div className="request-form-grid">
        <div className="form-card">
          <h5>Report Issues</h5>
          <p className="text-muted mb-3">Report any issues, problems, or concerns</p>
          
          {/* Report Type Selection */}
          <div className="mb-3">
            <label className="form-label">Report Type</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="missing"
                value="missing"
                checked={reportType === 'missing'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <label className="btn btn-outline-danger" htmlFor="missing">
                Missing Item
              </label>

              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="damaged"
                value="damaged"
                checked={reportType === 'damaged'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <label className="btn btn-outline-warning" htmlFor="damaged">
                Damaged Item
              </label>

              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="other"
                value="other"
                checked={reportType === 'other'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <label className="btn btn-outline-info" htmlFor="other">
                Other Issue
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter location (e.g., Room 101, Library, Lab)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="mb-3">
            <label className="form-label">Select Item to Report *</label>
            {teacherItems.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                <p className="mt-2 text-muted">No assigned items found</p>
              </div>
            ) : (
              <div 
                className="item-selection-grid"
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '10px'
                }}
              >
                {teacherItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`item-selection-option ${selectedItem === item.id ? 'selected' : ''}`}
                    onClick={() => handleItemSelection(item.id)}
                    style={{
                      padding: '15px',
                      border: selectedItem === item.id ? '2px solid #2196f3' : '1px solid #e9ecef',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: selectedItem === item.id ? '#e3f2fd' : 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedItem === item.id ? '0 2px 8px rgba(33, 150, 243, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedItem !== item.id) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa'
                        e.currentTarget.style.borderColor = '#2196f3'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedItem !== item.id) {
                        e.currentTarget.style.backgroundColor = 'white'
                        e.currentTarget.style.borderColor = '#e9ecef'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <div className="item-info" style={{ flex: 1 }}>
                      <div className="item-name" style={{ fontWeight: '600', fontSize: '1rem', color: '#333', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div className="item-category" style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '2px' }}>
                        Equipment
                      </div>
                      <div className="item-available" style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: '500' }}>
                        Available: {item.assigned}
                      </div>
                    </div>
                    <div className="selection-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {selectedItem === item.id ? (
                        <div 
                          className="d-flex align-items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="mb-0" style={{ fontSize: 12, color: '#64748b' }}>Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            max={item.assigned}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onBlur={(e) => e.stopPropagation()}
                            className="form-control form-control-sm"
                            style={{ 
                              width: 80,
                              textAlign: 'center',
                              WebkitAppearance: 'none',
                              MozAppearance: 'textfield'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="selection-indicator">
                          <i className="bi bi-plus-circle"></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue with the selected items..."
              required
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="request-actions" style={{ marginTop: '20px' }}>
        <button className="btn btn-danger" onClick={submitReport}>
          <i className="bi bi-exclamation-triangle"></i>
          Submit Report
        </button>
        <button className="btn btn-secondary" onClick={() => {
          setSelectedItem('')
          setDescription('')
          setLocation('')
          setQuantity(1)
          setReportType('missing')
        }}>
          <i className="bi bi-arrow-clockwise"></i>
          Reset Form
        </button>
      </div>
    </div>
  )
}

export default ReportForm
