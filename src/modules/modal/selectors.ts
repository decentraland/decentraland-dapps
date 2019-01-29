import { ModalState } from './reducer'

export const getState: (state: any) => ModalState = state => state.modal
