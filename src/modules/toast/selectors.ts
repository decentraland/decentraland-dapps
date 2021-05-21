import { ModalState } from './reducer'

export const getState: (state: any) => ModalState = state => state.modal
export const getOpenModals: (state: any) => ModalState = state => {
  const openModals = {}
  const modals = getState(state)

  for (const name in modals) {
    const modal = modals[name]
    if (modal.open) {
      openModals[name] = modal
    }
  }

  return openModals
}
