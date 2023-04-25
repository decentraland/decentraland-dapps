import React from 'react'
import { ProfileProps } from 'decentraland-ui/dist/components/Profile/Profile'

export type Props<T extends React.ElementType> = ProfileProps<T> & {
  debounce?: number
}
