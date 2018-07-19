import { AnyAction } from 'redux'

export function removeLast(
  actions: AnyAction[],
  comparator: (action: any) => boolean
) {
  // TODO: accomplish the same in one loop
  const last = actions.filter(comparator).pop()
  return actions.filter(action => action !== last)
}

export const getType = (action: AnyAction) => action.type.slice(10)
export const getStatus = (action: AnyAction) =>
  action.type.slice(1, 8).toUpperCase()
