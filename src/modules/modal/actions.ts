import { action } from 'typesafe-actions'

// Open Modal

export const OPEN_MODAL = 'Open Modal'

export const openModal = (name: string, metadata: any = null) =>
  action(OPEN_MODAL, {
    name,
    metadata
  })

export type OpenModalAction = ReturnType<typeof openModal>

// Close Modal

export const CLOSE_MODAL = 'Close Modal'

export const closeModal = (name?: string) => action(CLOSE_MODAL, { name })

export type CloseModalAction = ReturnType<typeof closeModal>
