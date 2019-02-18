export type IntercomWindow = Window & {
  Intercom?: Function
  intercomSettings: {
    alignment: string
    horizontal_padding: number
    vertical_padding: number
  }
}

export type IntercomSettings = {
  alignment: 'left' | 'right'
  horizontal_padding: number
  vertical_padding: number
}

export type DefaultProps = {
  data: Record<string, any>
  settings: IntercomSettings
}

export type Props = DefaultProps & {
  appId: string
}
