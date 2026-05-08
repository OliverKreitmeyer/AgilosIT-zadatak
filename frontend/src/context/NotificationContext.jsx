import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import {
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from '@coreui/react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [history, setHistory] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const idRef = useRef(0)

  const addToast = useCallback(({ title, message, color = 'success' }) => {
    const id = ++idRef.current
    const timestamp = new Date().toISOString()
    setToasts((prev) => [...prev, { id, title, message, color }])
    setHistory((prev) => [{ id, title, message, color, timestamp }, ...prev].slice(0, 50))

    // Only count as unread if the user isn't looking at the page
    if (document.hidden) {
      setUnreadCount((prev) => prev + 1)
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message })
      }
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{ addToast, history, unreadCount, markAllRead, clearHistory }}>
      {children}
      <CToaster className="p-3" placement="top-end">
        {toasts.map((t) => (
          <CToast
            key={t.id}
            autohide
            delay={6000}
            visible
            color={t.color}
            className="text-white align-items-center"
            onClose={() => removeToast(t.id)}
          >
            <div className="d-flex">
              <CToastBody>
                <strong>{t.title}</strong>
                <div className="small">{t.message}</div>
              </CToastBody>
              <CToastClose className="me-2 m-auto" white />
            </div>
          </CToast>
        ))}
      </CToaster>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}
