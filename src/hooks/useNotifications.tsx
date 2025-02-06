import React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone
} from '../modules/notifications'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import {
  DCLNotification,
  NotificationActiveTab
} from 'decentraland-ui/dist/components/Notifications/types'
import { CURRENT_AVAILABLE_NOTIFICATIONS } from 'decentraland-ui/dist/components/Notifications/utils'
import { NOTIFICATIONS_QUERY_INTERVAL } from '../containers/Navbar/constants'
import Profile from '../containers/Profile'
import { getBaseUrl } from '../lib'

const useNotifications = (
  identity: AuthIdentity | undefined,
  isNotificationsEnabled: boolean
) => {
  // Prevent unnecessary re-renders by storing the identity boolean state
  const wasIdentityPresent = useRef(false)
  
  console.log('[DEBUG][useNotifications] Hook called with identity:', !!identity, 'enabled:', isNotificationsEnabled, 'Previous identity state:', wasIdentityPresent.current)
  
  // Keep a ref to the current notifications client to prevent stale closures
  const notificationsClientRef = useRef<NotificationsAPI | null>(null)
  
  // Keep notifications in ref to ensure we always have access to latest state
  const notificationsRef = useRef<DCLNotification[]>([])
  
  const [{ isLoading, notifications }, setUserNotifications] = useState<{
    isLoading: boolean
    notifications: DCLNotification[]
  }>({
    isLoading: false,
    notifications: []
  })

  const [{ activeTab, isOnboarding, isOpen }, setNotificationsState] = useState(
    {
      activeTab: NotificationActiveTab.NEWEST,
      isOnboarding: checkIsOnboarding(),
      isOpen: false
    }
  )

  // Update notifications ref whenever state changes
  useEffect(() => {
    notificationsRef.current = notifications
    console.log('[DEBUG][useNotifications] Notifications state updated:', {
      count: notifications.length,
      unread: notifications.filter(n => !n.read).length
    })
  }, [notifications])

  // Create notifications client and store in ref
  useEffect(() => {
    const hasIdentityChanged = !!identity !== wasIdentityPresent.current
    console.log('[DEBUG][useNotifications] Setting up notifications client. Identity present:', !!identity, 'Changed:', hasIdentityChanged)
    
    if (hasIdentityChanged) {
      wasIdentityPresent.current = !!identity
      if (identity) {
        notificationsClientRef.current = new NotificationsAPI({ identity })
      } else {
        notificationsClientRef.current = null
      }
    }
  }, [identity])

  const handleNotificationsOpen = useCallback(async () => {
    const client = notificationsClientRef.current
    const currentNotifications = notificationsRef.current
    
    console.log('[DEBUG][useNotifications] handleNotificationsOpen called. Client exists:', !!client, 'Current state:', { 
      isOpen, 
      notifications: currentNotifications.length,
      client: !!client
    })
    
    const currentOpenState = isOpen

    setNotificationsState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })

    if (!currentOpenState) {
      const unreadNotifications = currentNotifications
        .filter(notification => !notification.read)
        .map(({ id }) => id)
      console.log('[DEBUG][useNotifications] Unread notifications to mark:', unreadNotifications.length, 'IDs:', unreadNotifications)
      if (unreadNotifications.length) {
        if (!client) {
          console.warn('[DEBUG][useNotifications] Cannot mark as read - notificationsClient is null')
          return
        }
        try {
          await client.markNotificationsAsRead(unreadNotifications)
          console.log('[DEBUG][useNotifications] Successfully marked notifications as read:', unreadNotifications)
          
          // Update local state after successful server update
          setUserNotifications(prev => ({
            ...prev,
            notifications: prev.notifications.map(notification => ({
              ...notification,
              read: unreadNotifications.includes(notification.id) ? true : notification.read
            }))
          }))
        } catch (error) {
          console.error('[DEBUG][useNotifications] Error marking notifications as read:', error)
        }
      }
    }
  }, [isOpen])

  const fetchNotificationsState = useCallback(async () => {
    const client = notificationsClientRef.current
    console.log('[DEBUG][useNotifications] Fetching notifications. Client exists:', !!client)
    
    if (!client) {
      console.log('[DEBUG][useNotifications] Skipping fetch - no client available')
      return
    }

    setUserNotifications(prev => ({ ...prev, isLoading: true }))
    
    try {
      const retrievedNotifications = await client.getNotifications()
      
      const filteredNotifications = retrievedNotifications
        .filter(notification => CURRENT_AVAILABLE_NOTIFICATIONS.includes(notification.type))
        .map((notification, index) => ({
          ...notification,
          read: index % 2 === 0 // Mark every other notification as unread for testing
        }))
      
      console.log('[DEBUG][useNotifications] Notifications retrieved:', {
        total: filteredNotifications.length,
        unread: filteredNotifications.filter(n => !n.read).length,
        status: filteredNotifications.map(n => ({ id: n.id, read: n.read }))
      })
      
      setUserNotifications({
        isLoading: false,
        notifications: filteredNotifications
      })
    } catch (error) {
      console.error('[DEBUG][useNotifications] Error fetching notifications:', error)
      setUserNotifications(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Setup polling effect
  useEffect(() => {
    console.log('[DEBUG][useNotifications] Effect triggered. Identity:', !!identity, 'Enabled:', isNotificationsEnabled)
    if (identity && isNotificationsEnabled) {
      fetchNotificationsState()

      const interval = setInterval(fetchNotificationsState, NOTIFICATIONS_QUERY_INTERVAL)

      return () => {
        console.log('[DEBUG][useNotifications] Cleaning up interval')
        clearInterval(interval)
      }
    }

    return () => {}
  }, [identity, isNotificationsEnabled, fetchNotificationsState])

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState(prevState => ({ ...prevState, isOnboarding: false }))
  }

  const handleOnChangeModalTab = (tab: NotificationActiveTab) =>
    setNotificationsState(prevState => ({
      ...prevState,
      activeTab: tab
    }))

  const handleRenderProfile = useCallback((address: string) => {
    return (
      <Profile
        address={address}
        as="a"
        href={`${getBaseUrl()}/profile/accounts/${address}`}
        style={{ fontWeight: 500, color: 'white', textDecoration: 'none' }}
        target="_blank"
      />
    )
  }, [])

  return {
    notificationsClient: notificationsClientRef.current,
    notifications,
    isLoading,
    isModalOpen: isOpen,
    modalActiveTab: activeTab,
    isNotificationsOnboarding: isOnboarding,
    handleOnBegin,
    handleNotificationsOpen,
    handleOnChangeModalTab,
    handleRenderProfile
  }
}

export default useNotifications
