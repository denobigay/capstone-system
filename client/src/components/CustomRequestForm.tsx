import React, { useState } from 'react'
import { apiFetch } from '../utils/api'

interface CustomRequestFormProps {
  currentUser: { role: string; name: string }
  onRequestSubmit: (requests: any[]) => Promise<void>
}

const CustomRequestForm: React.FC<CustomRequestFormProps> = ({ currentUser, onRequestSubmit }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    location: ''
  })
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }))
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      setImageFile(file)
      
      try {
        // Compress the image to reduce base64 size
        const compressedImage = await compressImage(file, 800, 0.8)
        setImage(compressedImage)
        console.log('Image compressed:', {
          originalSize: file.size,
          compressedSize: compressedImage.length,
          compressionRatio: ((file.size - compressedImage.length) / file.size * 100).toFixed(1) + '%'
        })
      } catch (error) {
        console.error('Error compressing image:', error)
        alert('Error processing image file')
        setImage(null)
        setImageFile(null)
      }
    }
  }

  const submitCustomRequest = async () => {
    try {
      if (!formData.item_name.trim()) {
        alert('Please enter an item name.')
        return
      }

      if (!formData.location.trim()) {
        alert('Please enter a location.')
        return
      }


      const payload = {
        item_name: formData.item_name,
        teacher_name: currentUser.name,
        teacher_id: currentUser.id, // Add teacher_id
        quantity_requested: formData.quantity,
        location: formData.location.trim(),
        subject: null, // Remove subject field
        notes: formData.description ? `CUSTOM REQUEST: ${formData.description}` : 'CUSTOM REQUEST',
        description: formData.description || '', // Allow empty description
        request_type: 'custom',
        photo: image || null // Include the base64 image or null
      }

      console.log('Sending payload:', {
        ...payload,
        photo: image ? `Base64 image (${image.length} characters)` : 'No image'
      }) // Debug log

      console.log('Submitting custom request:', payload)
      
      const res = await apiFetch('/api/custom-requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('Response status:', res.status)
      console.log('Response ok:', res.ok)

      if (!res.ok) {
        let errorMessage = 'Failed to submit custom request'
        try {
          const errorData = await res.json()
          console.log('Error data:', errorData)
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          console.log('JSON parse error:', jsonError)
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const responseData = await res.json()
      console.log('Success response:', responseData)
      alert('Custom request submitted!')
      
      // Reset form
      setFormData({
        item_name: '',
        description: '',
        quantity: 1,
        location: ''
      })
      setImage(null)
      setImageFile(null)
      
      // Call parent callback if provided
      if (onRequestSubmit) {
        await onRequestSubmit([payload])
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit custom request')
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
          <i className="bi bi-sliders text-info" style={{ fontSize: '20px' }}></i>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Custom Request</h4>
        </div>
      </div>
      
      <div className="request-form-grid">
        <div className="form-card">
          <h5>Request Custom Item</h5>
          <p className="text-muted mb-3">Request items not available in the inventory</p>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-control"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                placeholder="Enter item name"
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                style={{ 
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location (e.g., Room 101, Library, Lab)"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe the item you need (optional)"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Item Photo (Optional)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
            {image && (
              <div className="mt-2">
                <img 
                  src={image} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }} 
                />
              </div>
            )}
            <small className="text-muted">Upload a photo to help identify the item you need</small>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="request-actions" style={{ marginTop: '20px' }}>
        <button className="btn btn-info" onClick={submitCustomRequest}>
          <i className="bi bi-send"></i>
          Submit Custom Request
        </button>
        <button className="btn btn-secondary" onClick={() => {
          setFormData({
            item_name: '',
            description: '',
            quantity: 1,
            location: ''
          })
          setImage(null)
          setImageFile(null)
        }}>
          <i className="bi bi-arrow-clockwise"></i>
          Reset Form
        </button>
      </div>
    </div>
  )
}

export default CustomRequestForm
