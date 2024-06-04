import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getAnalytics } from '../modules/analytics'

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    const analytics = getAnalytics()
    if (analytics) {
      console.log({ location })
      analytics.page()
    }
  }, [location])
}
