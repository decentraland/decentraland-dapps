import { isMobile, insertScript } from '../../lib/utils'

import { IntercomWindow, IntercomSettings } from './Intercom.types'

const intercomWindow = window as IntercomWindow

export class IntercomWidget {
  appId: string
  settings: IntercomSettings
  client: (method: string, arg?: any) => void

  constructor(appId: string, settings?: IntercomSettings) {
    this.appId = appId

    if (settings) {
      this.setSettings(settings)
    }

    this.client = getWindowClient(this.appId)
  }

  setSettings(settings: IntercomSettings) {
    this.settings = settings
    intercomWindow.intercomSettings = settings
  }

  inject() {
    return new Promise(resolve => {
      if (this.isInjected()) {
        return resolve()
      }

      const script = insertScript({
        src: `https://widget.intercom.io/widget/${this.appId}`
      })
      script.addEventListener('load', resolve, true)
    }).then(() => {
      this.client = getWindowClient(this.appId)
    })
  }

  render(data: Record<string, any> = {}) {
    this.client('reattach_activator')
    this.client('update', { ...data, app_id: this.appId })
  }

  showNewMessage(text: string) {
    this.client('showNewMessage', text)
  }

  unmount() {
    this.client('shutdown')
  }

  isInjected() {
    return isInjected()
  }
}

function getWindowClient(appId: string) {
  return (...args: any[]) => {
    if (!appId) {
      return console.warn(
        'Intercom app id empty. Check that the environment is propery set'
      )
    }

    if (isMobile()) {
      return
    }

    if (!isInjected()) {
      return console.warn('Intercom called before injection')
    }

    intercomWindow.Intercom!(...args)
  }
}

function isInjected() {
  return typeof intercomWindow.Intercom === 'function'
}
