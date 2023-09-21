import React from 'react'
import { Rarity } from '@dcl/schemas'
import { RarityFilter as RarityFilterUI } from 'decentraland-ui/dist/components/RarityFilter'
import { t } from '../../modules/translation/utils'
import { RarityFilterProps } from './RarityFilters.types'

export const RarityFilter = (props: RarityFilterProps) => {
  const i18n = {
    rarities: {
      [Rarity.UNIQUE]: t('@dapps.rarities.unique'),
      [Rarity.MYTHIC]: t('@dapps.rarities.mythic'),
      [Rarity.LEGENDARY]: t('@dapps.rarities.legendary'),
      [Rarity.EPIC]: t('@dapps.rarities.epic'),
      [Rarity.RARE]: t('@dapps.rarities.rare'),
      [Rarity.UNCOMMON]: t('@dapps.rarities.uncommon'),
      [Rarity.COMMON]: t('@dapps.rarities.common')
    },
    title: t('@dapps.rarities_filter.title'),
    all_rarities: t('@dapps.rarities_filter.all_rarities'),
    count_rarities: (count: number) =>
      t('@dapps.rarities_filter.count_rarities', { count: count }),
    tooltip: t('@dapps.rarities_filter.tooltip')
  }

  return <RarityFilterUI i18n={i18n} {...props} />
}
