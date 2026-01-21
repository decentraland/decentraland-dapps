import React, { useMemo } from 'react'
import { Item, Rarity } from '@dcl/schemas'
import {
  CatalogCard as AssetCardUi,
  CatalogCardProps as AssetCardUiProps,
} from 'decentraland-ui/dist/components/CatalogCard/CatalogCard'
import { t } from '../../modules/translation/utils'
import {
  formatWeiToAssetCardEther,
  getCatalogCardInformation,
  getOwnersText,
} from './utils'

export type AssetCardTranslations = {
  also_minting: React.ReactNode
  available_for_mint: React.ReactNode
  available_listings_in_range: React.ReactNode
  cheapest_listing: React.ReactNode
  cheapest_option_range: React.ReactNode
  cheapest_option: React.ReactNode
  listing: React.ReactNode
  listings: React.ReactNode
  most_expensive_range: React.ReactNode
  most_expensive: React.ReactNode
  not_for_sale: React.ReactNode
  owners: React.ReactNode
  owner: React.ReactNode
}

export type AssetCardFilters = {
  price?: number
  sortBy?: string
  minPrice?: string
  maxPrice?: string
}

export type AssetCardProps = {
  asset: Item
  assetFilters?: AssetCardFilters
}

export const AssetCard = (props: AssetCardProps) => {
  const { asset, assetFilters } = props

  const i18n: AssetCardTranslations = {
    listing: t('@dapps.asset_card.listing'),
    listings: t('@dapps.asset_card.listings'),
    available_for_mint: t('@dapps.asset_card.available_for_mint'),
    available_listings_in_range: t(
      '@dapps.asset_card.available_listings_in_range',
    ),
    cheapest_listing: t('@dapps.asset_card.cheapest_listing'),
    not_for_sale: t('@dapps.asset_card.not_for_sale'),
    owner: t('@dapps.asset_card.owner'),
    owners: t('@dapps.asset_card.owners'),
    cheapest_option: t('@dapps.asset_card.cheapest_option'),
    cheapest_option_range: t('@dapps.asset_card.cheapest_option_range'),
    most_expensive: t('@dapps.asset_card.most_expensive'),
    most_expensive_range: t('@dapps.asset_card.most_expensive_range'),
    also_minting: t('@dapps.asset_card.also_minting'),
  }

  const catalogItemInformation = useMemo(() => {
    return getCatalogCardInformation(asset, i18n, assetFilters)
  }, [asset])

  const isAvailableForMint = asset.isOnSale && asset.available > 0
  const notForSale = !isAvailableForMint && !asset.minListingPrice

  const price = useMemo(() => {
    return catalogItemInformation.price?.includes('-')
      ? `${formatWeiToAssetCardEther(catalogItemInformation.price.split(' - ')[0])} - ${formatWeiToAssetCardEther(
          catalogItemInformation.price.split(' - ')[1],
        )}`
      : catalogItemInformation.price
        ? formatWeiToAssetCardEther(catalogItemInformation.price)
        : undefined
  }, [catalogItemInformation.price])

  const propsCard: AssetCardUiProps = {
    asset: {
      id: asset.id,
      url: asset.url,
      name: asset.name,
      rarity: asset.rarity,
      network: asset.network,
      creator: asset.creator,
    },
    action: catalogItemInformation.action,
    actionIcon: catalogItemInformation.actionIcon,
    imagensrc: asset.thumbnail,
    extraInformation: catalogItemInformation.extraInformation,
    notForSale: notForSale,
    price: price,
    owners: getOwnersText(asset.owners, i18n),
    i18n: {
      rarities: {
        [Rarity.COMMON]: t('@dapps.rarities.common'),
        [Rarity.UNCOMMON]: t('@dapps.rarities.uncommon'),
        [Rarity.EXOTIC]: t('@dapps.rarities.exotic'),
        [Rarity.RARE]: t('@dapps.rarities.rare'),
        [Rarity.EPIC]: t('@dapps.rarities.epic'),
        [Rarity.LEGENDARY]: t('@dapps.rarities.legendary'),
        [Rarity.MYTHIC]: t('@dapps.rarities.mythic'),
        [Rarity.UNIQUE]: t('@dapps.rarities.unique'),
      },
      rarities_description: {
        [Rarity.COMMON]: t('@dapps.rarities_description.common'),
        [Rarity.UNCOMMON]: t('@dapps.rarities_description.uncommon'),
        [Rarity.EXOTIC]: t('@dapps.rarities_description.exotic'),
        [Rarity.RARE]: t('@dapps.rarities_description.rare'),
        [Rarity.EPIC]: t('@dapps.rarities_description.epic'),
        [Rarity.LEGENDARY]: t('@dapps.rarities_description.legendary'),
        [Rarity.MYTHIC]: t('@dapps.rarities_description.mythic'),
        [Rarity.UNIQUE]: t('@dapps.rarities_description.unique'),
      },
    },
  }

  return <AssetCardUi {...propsCard} />
}
