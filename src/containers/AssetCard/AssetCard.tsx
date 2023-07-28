import React, { useMemo } from 'react'
import { Item } from '@dcl/schemas'
import {
  formatWeiToAssetCardEther,
  getAssetImage,
  getCatalogCardInformation
} from './utils'
import './AssetCard.css'

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

  const price = catalogItemInformation.price?.includes('-')
    ? `${formatWeiToAssetCardEther(
        catalogItemInformation.price.split(' - ')[0]
      )} - ${formatWeiToAssetCardEther(
        catalogItemInformation.price.split(' - ')[1]
      )}`
    : catalogItemInformation.price
    ? formatWeiToAssetCardEther(catalogItemInformation.price)
    : undefined

  //TODO: remove this type and import it from ui
  type AssetCardProps = {
    asset: Pick<Item, 'id' | 'url' | 'name' | 'rarity' | 'network' | 'creator'>
    action: React.ReactNode
    actionIcon?: React.ReactNode
    imagensrc: string
    extraInformation: React.ReactNode
    notForSale: boolean
    price?: string
    owners?: string
    onClickCardURL: string
  }

  const propsCard: AssetCardProps = {
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
    imagensrc: getAssetImage(asset),
    extraInformation: catalogItemInformation.extraInformation,
    notForSale: notForSale,
    price: price,
    owners: `${asset.owners} ${asset.owners === 1 ? i18n.owner : i18n.owners}`,
    onClickCardURL: onClickCardURL
  }

  // TODO: remove this console.log
  console.log(propsCard)

  return <div>ASSET CARD</div>
  // TODO: it should be call as this imported from ui
  // return <AssetCard {...propsCard} />
}
