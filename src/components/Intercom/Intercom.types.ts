export type IntercomWindow = Window & {
  Intercom?: Function
  intercomSettings: IntercomSettings
}

export type IntercomSettings = Partial<{
  alignment: 'left' | 'right'
  horizontal_padding: number
  vertical_padding: number
}>

export type DefaultProps = {
  data: Record<string, any>
  settings: IntercomSettings
}

export type Props = DefaultProps & {
  appId: string
}
