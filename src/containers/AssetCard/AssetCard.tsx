import React, { useMemo } from 'react'
import { Item } from '@dcl/schemas'
import {
  AssetCard as AssetCardUi,
  AssetCardProps as AssetCardUiProps
} from 'decentraland-ui/dist/components/AssetCard/AssetCard'
import { formatWeiToAssetCardEther, getCatalogCardInformation } from './utils'
import { t } from '../../modules/translation/utils'

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
  assetFilters: AssetCardFilters
  onClickCardURL: string
}

export const AssetCard = (props: AssetCardProps) => {
  const { asset, assetFilters } = props

  const i18n: AssetCardTranslations = {
    listing: t('@dapps.asset_card.listing'),
    listings: t('@dapps.asset_card.listings'),
    available_for_mint: t('@dapps.asset_card.available_for_mint'),
    available_listings_in_range: t(
      '@dapps.asset_card.available_listings_in_range'
    ),
    cheapest_listing: t('@dapps.asset_card.cheapest_listing'),
    not_for_sale: t('@dapps.asset_card.not_for_sale'),
    owner: t('@dapps.asset_card.owner'),
    owners: t('@dapps.asset_card.owners'),
    cheapest_option: t('@dapps.asset_card.cheapest_option'),
    cheapest_option_range: t('@dapps.asset_card.cheapest_option_range'),
    most_expensive: t('@dapps.asset_card.most_expensive'),
    most_expensive_range: t('@dapps.asset_card.most_expensive_range'),
    also_minting: t('@dapps.asset_card.also_minting')
  }

  const catalogItemInformation = useMemo(() => {
    return getCatalogCardInformation(asset, i18n, assetFilters)
  }, [asset])

  const isAvailableForMint = asset.isOnSale && asset.available > 0
  const notForSale = !isAvailableForMint && !asset.minListingPrice

  const price = useMemo(() => {
    return catalogItemInformation.price?.includes('-')
      ? `${formatWeiToAssetCardEther(
          catalogItemInformation.price.split(' - ')[0]
        )} - ${formatWeiToAssetCardEther(
          catalogItemInformation.price.split(' - ')[1]
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
      creator: asset.creator
    },
    action: catalogItemInformation.action,
    actionIcon: catalogItemInformation.actionIcon,
    imagensrc: asset.thumbnail,
    extraInformation: catalogItemInformation.extraInformation,
    notForSale: notForSale,
    price: price,
    owners: `${asset.owners} ${asset.owners === 1 ? i18n.owner : i18n.owners}`
  }

  return <AssetCardUi {...propsCard} />
}
