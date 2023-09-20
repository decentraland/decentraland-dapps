import { Rarity } from '@dcl/schemas'

export type RarityFilterProps = {
  className?: string
  rarities: string[]
  onChange: (value: Rarity[]) => void
  defaultCollapsed?: boolean
}
