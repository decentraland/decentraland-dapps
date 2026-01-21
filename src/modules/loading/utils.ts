import { AnyAction } from 'redux'

export function removeLast(
  actions: AnyAction[],
  comparator: (action: any) => boolean,
) {
  // TODO: accomplish the same in one loop
  const last = actions.filter(comparator).pop()
  return actions.filter((action) => action !== last)
}

const ACTION_TYPE_REGEX = /\[(Request|Failure|Success|Clear)\]\s(.+)/

export const getType = (action: AnyAction) => {
  const match = ACTION_TYPE_REGEX.exec(action.type)
  if (match && match.length > 2) {
    return match[2]
  }

  return ''
}

export const getStatus = (action: AnyAction) => {
  const match = ACTION_TYPE_REGEX.exec(action.type)
  if (match && match.length > 2) {
    return match[1].toUpperCase()
  }

  return ''
}
