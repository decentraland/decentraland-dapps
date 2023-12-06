import { getEnv, Env } from "@dcl/ui-env";
import { BaseClient, BaseClientConfig } from "../lib/BaseClient";
import { DCLNotification } from "decentraland-ui/dist/components/Notifications/types"


export default class NotificationsAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url = getEnv() === Env.DEVELOPMENT || Env.STAGING ? "https://notifications.decentraland.zone" : "https://notifications.decentraland.org"

    super(url, config)
  }

  async getNotifications(limit?: number, from?: number) {
    const params = new URLSearchParams()

    if (limit) {
      params.append("limit", `${limit}`)
    }

    if (from) {
      params.append("from", `${from}`)
    }

    const notificationsResponse = await this.fetch<{notifications: Array<DCLNotification>}>(`/notifications${params.size ? `?${params.toString()}` : ''}`)

    return notificationsResponse
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