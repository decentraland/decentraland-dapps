import { LocalizedField } from '@dcl/schemas'

/**
 * The campaign fields this module reads beyond what `@dcl/schemas` types in `CampaignFields`.
 *
 * Both were added to the Contentful content type after that type shipped, so they are read off the entry
 * and validated here rather than trusted. An editor types them by hand into a text field, which is why
 * neither parser rejects a whole list over one bad entry.
 */
export type CuratedSelectionFields = {
  itemIds?: LocalizedField<string | string[]>
  collectionIds?: LocalizedField<string | string[]>
}

const ADDRESS = /^0x[0-9a-f]{40}$/
const COMPOSITE_ITEM_ID = /^(0x[0-9a-f]{40})-(\d+)$/

/** Commas, semicolons and any whitespace, so a list pasted across lines survives. */
const SEPARATORS = /[\s,;]+/

/**
 * The entries of a field an editor fills in, whatever shape Contentful hands it over in.
 *
 * The type on the way in is a cast, not a guarantee: these fields are not in `CampaignFields`, and the
 * content type behind them can be changed in the space with no deploy here. A Symbol turned into a Symbol
 * LIST arrives as an array, and calling `.split` on it would throw inside the saga — whose `catch`
 * dispatches `fetchCampaignFailure` and takes the banners, the name and the tags down with it. Losing a
 * whole campaign to a field that changed shape is the opposite of what the dropping below is for.
 */
const entries = (value: string | string[] | undefined): string[] => {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(SEPARATORS) : []
  return list
    .filter((entry): entry is string => typeof entry === 'string')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * The INDIVIDUAL items a campaign names, as `<contract>-<itemId>`.
 *
 * Collections are the wrong unit for a curated event: a seasonal list of 27 items can live in 26 different
 * creator collections, and naming those whole puts three times the items on the page. Leading zeros are
 * stripped from the item id so `0x…-007` and `0x…-7` cannot select the same item twice.
 */
export const parseItemIds = (value: string | string[] | undefined): string[] =>
  Array.from(
    new Set(
      entries(value)
        .map(entry => COMPOSITE_ITEM_ID.exec(entry))
        .filter((match): match is RegExpExecArray => match !== null)
        // Stripped as a string, not through `Number`: an id past 2^53 would round to a DIFFERENT item, and
        // a long enough one would turn into exponential notation and stop matching the format at all.
        .map(([, contract, itemId]) => `${contract}-${itemId.replace(/^0+(?=\d)/, '')}`)
    )
  )

/**
 * The collections a campaign names one by one, on top of whatever its tags resolve to.
 *
 * Tagging lives in the builder, where creators own their own collections, so an event that needs one more
 * collection has no way to add it there. This field is that escape hatch.
 */
export const parseCollectionIds = (value: string | string[] | undefined): string[] =>
  Array.from(new Set(entries(value).filter(entry => ADDRESS.test(entry))))
