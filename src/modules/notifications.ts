import { getEnv, Env } from '@dcl/ui-env'
import {
  Entity,
  Scene,
  NotificationChannelType,
  NotificationType,
  Subscription,
  SubscriptionDetails
} from '@dcl/schemas'
import { DCLNotification } from 'decentraland-ui/dist/components/Notifications/types'

import { BaseClient, BaseClientConfig } from '../lib/BaseClient'

export const NOTIFICATIONS_LIMIT = 50

export class NotificationsAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url =
      getEnv() === Env.DEVELOPMENT
        ? 'https://notifications.decentraland.zone'
        : 'https://notifications.decentraland.org'

    super(url, config)
  }

  async getNotifications(limit: number = NOTIFICATIONS_LIMIT, from?: number) {
    const params = new URLSearchParams()

    if (limit) {
      params.append('limit', `${limit}`)
    }

    if (from) {
      params.append('from', `${from}`)
    }

    const { notifications } = await this.fetch<{
      notifications: Array<DCLNotification>
    }>(
      `/notifications${params.toString().length ? `?${params.toString()}` : ''}`
    )

    return notifications.map(parseNotification)
  }

  async markNotificationsAsRead(ids: string[]) {
    await this.fetch('/notifications/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds: ids }),
      metadata: { notificationIds: ids },
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async getSubscriptionSettings() {
    await this.fetch('/subscription')
  }

  async putSubscriptionSettings(subscriptionDetails: SubscriptionDetails) {
    await this.fetch('/subscription', {
      method: 'PUT',
      body: JSON.stringify(subscriptionDetails),
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

const ONBOARDING_KEY = 'dcl_notifications_onboarding'

export const checkIsOnboarding = () => {
  if (typeof window !== 'undefined') {
    const isOnboarding = localStorage.getItem(ONBOARDING_KEY)
    if (isOnboarding) {
      const value = JSON.parse(isOnboarding)
      return value
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true')
      return true
    }
  }
}

export const setOnboardingDone = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ONBOARDING_KEY, 'false')
  }
}

const parseNotification = (notification: DCLNotification): DCLNotification => {
  return {
    ...notification,
    timestamp: Number(notification.timestamp)
  }
}
