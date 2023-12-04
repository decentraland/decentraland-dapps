import { getEnv, Env } from "@dcl/ui-env";
import { BaseClient, BaseClientConfig } from "../lib/BaseClient";
import { DCLNotification } from "decentraland-ui/dist/components/Notifications/types"


export default class NotificationsAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url = getEnv() === Env.DEVELOPMENT || Env.STAGING ? "https://notifications.decentraland.zone" : "https://notifications.decentraland.org"

    super(url, config)
  }

  async getNotifications() {
    const notificationsResponse = await this.fetch<{notifications: Array<DCLNotification>}>('/notifications')

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