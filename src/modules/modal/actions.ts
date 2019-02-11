import { action } from 'typesafe-actions'

export let modals: { [key: string]: any } = {}

// Open Modal

export const OPEN_MODAL = 'Open Modal'

export const getModalActions = <T>() => ({
  openModal: function(name: T, metadata: any = null) {
    return action(OPEN_MODAL, {
      name,
      metadata
    })
  },
  closeModal: function(name: T) {
    return action(CLOSE_MODAL, { name })
  },
  toggleModal: function(name: T) {
    return action(TOGGLE_MODAL, { name })
  }
})

const { openModal, closeModal, toggleModal } = getModalActions<string>()

export { openModal }

export type OpenModalAction = ReturnType<typeof openModal>

// Close Modal

export const CLOSE_MODAL = 'Close Modal'

export { closeModal }

export type CloseModalAction = ReturnType<typeof closeModal>

// Toggle Modal

export const TOGGLE_MODAL = 'Toggle Modal'

export { toggleModal }

export type ToggleModalAction = ReturnType<typeof toggleModal>

// Close All Modals

export const CLOSE_ALL_MODALS = 'Close All Modal'

export const closeAllModals = () => action(CLOSE_ALL_MODALS, {})

export type CloseAllModalsAction = ReturnType<typeof closeAllModals>
