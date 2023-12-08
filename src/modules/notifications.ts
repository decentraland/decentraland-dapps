import { getEnv, Env } from "@dcl/ui-env";
import { BaseClient, BaseClientConfig } from "../lib/BaseClient";
import { DCLNotification } from "decentraland-ui/dist/components/Notifications/types"

export const NOTIFICATIONS_LIMIT = 50;

export class NotificationsAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url = getEnv() === Env.DEVELOPMENT ? "https://notifications.decentraland.zone" : "https://notifications.decentraland.org"

    super(url, config)
  }

  async getNotifications(limit: number = NOTIFICATIONS_LIMIT, from?: number) {
    const params = new URLSearchParams()

    if (limit) {
      params.append("limit", `${limit}`)
    }

    if (from) {
      params.append("from", `${from}`)
    }

    const { notifications } = await this
    .fetch<{notifications: Array<DCLNotification>}>(`/notifications${params.toString().length ? `?${params.toString()}` : ''}`)

    return notifications.map(parseNotification)
  }

  async markNotificationsAsRead(ids: string[]) {
    await this.fetch('/notifications/read', { 
      method: "PUT", 
      body: JSON.stringify({ notificationIds: ids }), 
      metadata: { notificationIds: ids }, 
      headers: { "Content-Type": "application/json" }  
    })
  }
  
}

export const checkIsOnboarding = () => {
  const isOnboarding = localStorage.getItem('dcl_notifications_onboarding')
  if (isOnboarding) {
    return false
  } else {
    localStorage.setItem('dcl_notifications_onboarding', "true")
    return true
  }
}

const parseNotification = (notification: DCLNotification): DCLNotification => {
  return ({
    ...notification,
    timestamp: Number(notification.timestamp)
  })
}