import { LocalizedField } from '@dcl/schemas'

/**
 * The campaign fields this module reads beyond what `@dcl/schemas` types in `CampaignFields`.
 *
 * Both were added to the Contentful content type after that type shipped, so they are read off the entry
 * and validated here rather than trusted. An editor types them by hand into a text field, which is why
 * neither parser rejects a whole list over one bad entry.
 */
export type CuratedSelectionFields = {
  itemIds?: LocalizedField<string>
  collectionIds?: LocalizedField<string>
}

const ADDRESS = /^0x[0-9a-f]{40}$/
const COMPOSITE_ITEM_ID = /^(0x[0-9a-f]{40})-(\d+)$/

/** Commas, semicolons and any whitespace, so a list pasted across lines survives. */
const SEPARATORS = /[\s,;]+/

const entries = (value: string | undefined): string[] =>
  value
    ? value
        .split(SEPARATORS)
        .map(entry => entry.trim().toLowerCase())
        .filter(Boolean)
    : []

/**
 * The INDIVIDUAL items a campaign names, as `<contract>-<itemId>`.
 *
 * Collections are the wrong unit for a curated event: a seasonal list of 27 items can live in 26 different
 * creator collections, and naming those whole puts three times the items on the page. Leading zeros are
 * stripped from the item id so `0x…-007` and `0x…-7` cannot select the same item twice.
 */
export const parseItemIds = (value: string | undefined): string[] =>
  Array.from(
    new Set(
      entries(value)
        .map(entry => COMPOSITE_ITEM_ID.exec(entry))
        .filter((match): match is RegExpExecArray => match !== null)
        .map(([, contract, itemId]) => `${contract}-${Number(itemId)}`)
    )
  )

/**
 * The collections a campaign names one by one, on top of whatever its tags resolve to.
 *
 * Tagging lives in the builder, where creators own their own collections, so an event that needs one more
 * collection has no way to add it there. This field is that escape hatch.
 */
export const parseCollectionIds = (value: string | undefined): string[] =>
  Array.from(new Set(entries(value).filter(entry => ADDRESS.test(entry))))
