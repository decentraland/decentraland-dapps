import { useMemo } from 'react'
import { AssetStatus, AssetStatusFilter as AssetStatusFilterUI } from 'decentraland-ui/dist/components/AssetStatusFilter'
import { t } from '../../modules/translation/utils'
import { AssetStatusFilterProps } from './AssetStatusFilter.types'

export const AssetStatusFilter = (props: AssetStatusFilterProps) => {
  const i18n = useMemo(
    () => ({
      title: t('@dapps.asset_status_filter.title'),
      status: {
        [AssetStatus.NOT_FOR_SALE]: t('@dapps.asset_status_filter.not_for_sale'),
        [AssetStatus.ONLY_LISTING]: t('@dapps.asset_status_filter.only_listing'),
        [AssetStatus.ONLY_MINTING]: t('@dapps.asset_status_filter.only_minting'),
        [AssetStatus.ON_SALE]: t('@dapps.asset_status_filter.on_sale')
      },
      tooltips: {
        [AssetStatus.NOT_FOR_SALE]: t('@dapps.asset_status_filter.not_for_sale_tooltip'),
        [AssetStatus.ONLY_LISTING]: t('@dapps.asset_status_filter.only_listing_tooltip'),
        [AssetStatus.ONLY_MINTING]: t('@dapps.asset_status_filter.only_minting_tooltip'),
        [AssetStatus.ON_SALE]: t('@dapps.asset_status_filter.on_sale_tooltip')
      }
    }),
    []
  )

  return <AssetStatusFilterUI i18n={i18n} {...props} />
}
