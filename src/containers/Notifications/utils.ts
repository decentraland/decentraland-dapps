import { DCLNotification } from "decentraland-ui/dist/components/Notifications/types"

export const checkIsOnboarding = () => {
  const isOnboarding = localStorage.getItem('dcl_notifications_onboarding')
  if (isOnboarding) {
    return false
  } else {
    localStorage.setItem('dcl_notifications_onboarding', "true")
    return true
  }
}

export const parseNotification = (notification: DCLNotification): DCLNotification => {
  return ({
    ...notification,
    timestamp: Number(notification.timestamp) * 1000
  })
}