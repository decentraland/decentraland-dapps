import { Toast } from './types'

const cache: Record<string, Toast> = {}

export function set(id: number, toast: Toast | Omit<Toast, 'id'>) {
  cache[id] = { ...toast, id }
}

export function get(id: string | number): Toast {
  if (!(id in cache)) {
    throw new Error(`Invalid toast id ${id}. Did you close it already?`)
  }
  return cache[id]
}

export function remove(id: string | number): boolean {
  return delete cache[id]
}

export function getAll(): Toast[] {
  return Object.values(cache)
}
