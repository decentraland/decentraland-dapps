import { isMobile, insertScript } from '../../lib/utils'

import { IntercomWindow, IntercomSettings } from './Intercom.types'

const intercomWindow = window as IntercomWindow

export class IntercomWidget {
  private _appId: string
  private _settings: IntercomSettings
  client: (method: string, arg?: any) => void

  static instance: IntercomWidget

  private constructor() {}

  static getInstance(): IntercomWidget {
    if (!this.instance) {
      this.instance = new IntercomWidget()
    }
    return this.instance
  }

  set appId(id: string) {
    this._appId = id
    this.client = getWindowClient(id)
  }

  get appId() {
    return this._appId
  }

  set settings(settings: IntercomSettings) {
    this._settings = settings
    intercomWindow.intercomSettings = settings
  }

  get settings() {
    return this._settings
  }

  init(appId: string, settings?: IntercomSettings) {
    this.appId = appId

    if (settings) {
      this.settings = settings
    }
  }

  inject() {
    return new Promise(resolve => {
      if (this.isInjected()) {
        return resolve()
      }

      const script = insertScript({
        src: `https://widget.intercom.io/widget/${this._appId}`
      })
      script.addEventListener('load', resolve, true)
    }).then(() => {
      this.client = getWindowClient(this._appId)
    })
  }

  render(data: Record<string, any> = {}) {
    this.client('reattach_activator')
    this.client('update', { ...data, app_id: this._appId })
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
