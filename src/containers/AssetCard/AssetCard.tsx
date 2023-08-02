import React, { useMemo } from 'react'
import { Item } from '@dcl/schemas'
import {
  AssetCard as AssetCardUi,
  AssetCardProps as AssetCardUiProps
} from 'decentraland-ui/dist/components/AssetCard/AssetCard'
import { formatWeiToAssetCardEther, getCatalogCardInformation } from './utils'

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
  i18n: AssetCardTranslations
  asset: Item
  assetFilters: AssetCardFilters
  onClickCardURL: string
}

export const AssetCard = (props: AssetCardProps) => {
  const { asset, i18n, onClickCardURL, assetFilters } = props

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
    owners: `${asset.owners} ${asset.owners === 1 ? i18n.owner : i18n.owners}`,
    onClickCardURL: onClickCardURL
  }

  return <AssetCardUi {...propsCard} />
}
