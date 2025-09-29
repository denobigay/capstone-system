import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '../context/AuthContext'

type Props = {
  isOpen: boolean
  onClose: () => void
  onDetected: (decodedText: string) => void
}

export default function AdminQrScanner({ isOpen, onClose, onDetected }: Props) {
  const { user } = useAuth()
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const startedRef = useRef(false)

  const cleanupMediaStreams = () => {
    document.querySelectorAll('video').forEach((v) => {
      const vid = v as HTMLVideoElement
      try {
        const stream = vid.srcObject as MediaStream | null
        stream?.getTracks().forEach((t) => t.stop())
        vid.srcObject = null
      } catch {}
    })
  }

  const stopAndClear = async () => {
    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop() } catch {}
        try { await scannerRef.current.clear() } catch {}
        scannerRef.current = null
      }
    } finally {
      cleanupMediaStreams()
      startedRef.current = false
      ;(window as any).__ADMIN_QR_ACTIVE = false
    }
  }

  useEffect(() => {
    if (!isOpen || !user || user.role !== 'ADMIN') return
    if ((window as any).__ADMIN_QR_ACTIVE) return
    (window as any).__ADMIN_QR_ACTIVE = true
    let cancelled = false

    const init = async () => {
      setIsCameraLoading(true)
      await stopAndClear()
      await new Promise((r) => setTimeout(r, 100))
      const el = document.getElementById('admin-qr-inline')
      if (!el) { setIsCameraLoading(false); return }
      el.innerHTML = ''
      const scanner = new Html5Qrcode('admin-qr-inline')
      scannerRef.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 280 } },
          (decodedText) => {
            if (cancelled) return
            onDetected(decodedText)
            stopAndClear().finally(() => onClose())
          },
          () => {}
        )
        startedRef.current = true
      } catch (e) {
        console.error('Failed to start Html5Qrcode', e)
      } finally {
        setIsCameraLoading(false)
      }
    }
    init()

    return () => {
      cancelled = true
      stopAndClear()
    }
  }, [isOpen, user])

  if (!isOpen || !user || user.role !== 'ADMIN') return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Scan QR Code</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {isCameraLoading && (
              <div className="camera-loading">
                <i className="bi bi-camera-video"></i>
                <p>Initializing QR scanner...</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 520, maxWidth: '100%', background: '#000', borderRadius: 12, padding: 16 }}>
                <div id="admin-qr-inline" style={{ width: '100%', height: 360 }} />
                <div style={{ marginTop: 12, textAlign: 'center', color: '#94a3b8' }}>Position QR code within the frame</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


