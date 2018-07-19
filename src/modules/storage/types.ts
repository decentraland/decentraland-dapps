import { LOAD, SAVE } from 'redux-storage'

export const STORAGE_LOAD = LOAD
export const STORAGE_SAVE = SAVE

// Interface and type definitions

export type StorageState = {
  loading: boolean
}
