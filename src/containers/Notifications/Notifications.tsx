import React, { useEffect, useState } from "react"

import { AuthIdentity } from "@dcl/crypto"
import NotificationsUI from "decentraland-ui/dist/components/Notifications/Notifications"
import { DCLNotification, NotificationLocale } from "decentraland-ui/dist/components/Notifications/types"
import NotificationsAPI from "../../modules/notifications"
import { getPreferredLocale } from "../../modules/translation/utils"
import { checkIsOnboarding, parseNotification } from "./utils"

type NotificationsProps = {
  identity: AuthIdentity | null
}

export default function Notifications(props: NotificationsProps) {
  const [notifications, setNotifications] = useState<DCLNotification[]>([])
  const [activeTab, setActiveTab] = useState<'newest' | 'read'>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(checkIsOnboarding())
  const [isOpen, setIsOpen] = useState(false)
  
  let client: NotificationsAPI
  if (props.identity) {
    client = new NotificationsAPI({ identity: props.identity })
  }

  const fetchNotificationsState = () => {
    setIsLoading(true)
    client.getNotifications(50)
    .then((response) => {
      const parsed = response
      .notifications
      .map(parseNotification)

      setNotifications(parsed)
    })
    .finally(() => setIsLoading(false))
  }

  const handleToggleOpen = async () => {
    let currentState = isOpen
    setIsOpen(!isOpen)
    if (!currentState) {
      const unreadNotifications = notifications.filter((notification) => !notification.read).map(({ id }) => id)
      if (unreadNotifications.length) {
        await client.markNotificationsAsRead(unreadNotifications)
      }
    } else {
      const markCurrentNotificationsAsRead = notifications.map((notification) => {
        if (notification.read) return notification

        return ({
          ...notification,
          read: true
        })
      })
      setNotifications(markCurrentNotificationsAsRead)
    }
  }

  useEffect(() => {
    if (props.identity) {
      fetchNotificationsState()

      const interval = setInterval(() => {
        fetchNotificationsState()
      }, 60000)

      return () => {
        clearInterval(interval)
      }
    } else {
      return () => {}
    }
  }, [props.identity])
  
  return <NotificationsUI
    locale={(getPreferredLocale(['en', 'es', 'zh']) as NotificationLocale)|| 'en'}
    isOnboarding={isOnboarding}
    isLoading={isLoading}
    isOpen={isOpen}
    onClick={handleToggleOpen}
    activeTab={activeTab} 
    onChangeTab={(_, tab) => setActiveTab(tab)} 
    onBegin={() => setIsOnboarding(false)} 
    items={notifications}  
  />
}
