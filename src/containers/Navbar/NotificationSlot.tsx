import React from 'react'
import { DCLNotification } from 'decentraland-ui/dist/components/Notifications/types'
import {
  BellButton,
  NotificationBadge,
  NotificationEmpty,
  NotificationHeader,
  NotificationList,
  NotificationPanel,
  NotificationTitle,
  NotificationWrapper
} from 'decentraland-ui2'
import { NotificationComponentByType } from 'decentraland-ui2/dist/components/Notifications/utils'
import { BellIcon } from 'decentraland-ui2/dist/components/Navbar/icons'
import type { NotificationLocale } from 'decentraland-ui2'
import { t } from '../../modules/translation'

type NotificationSlotProps = {
  locale: string
  notifications: DCLNotification[]
  isLoading: boolean
  isOpen: boolean
  onToggle: () => void
  renderProfile?: (address: string) => JSX.Element | string | null
}

const NotificationSlot: React.FC<NotificationSlotProps> = ({ locale, notifications, isLoading, isOpen, onToggle, renderProfile }) => {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationWrapper>
      <BellButton onClick={onToggle} className={unreadCount > 0 ? 'has-unread' : ''}>
        <BellIcon />
        {unreadCount > 0 && <NotificationBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotificationBadge>}
      </BellButton>
      {isOpen && (
        <NotificationPanel>
          <NotificationHeader>
            <NotificationTitle>{t('@dapps.notifications.title')}</NotificationTitle>
          </NotificationHeader>
          <NotificationList>
            {isLoading && notifications.length === 0 && <NotificationEmpty>{t('@dapps.notifications.loading')}</NotificationEmpty>}
            {!isLoading && notifications.length === 0 && <NotificationEmpty>{t('@dapps.notifications.empty')}</NotificationEmpty>}
            {notifications.map(notification => {
              const Component = NotificationComponentByType[notification.type as keyof typeof NotificationComponentByType]
              if (!Component) return null
              return (
                <Component
                  key={notification.id}
                  notification={notification}
                  locale={locale as NotificationLocale}
                  renderProfile={renderProfile}
                />
              )
            })}
          </NotificationList>
        </NotificationPanel>
      )}
    </NotificationWrapper>
  )
}

export default React.memo(NotificationSlot)
