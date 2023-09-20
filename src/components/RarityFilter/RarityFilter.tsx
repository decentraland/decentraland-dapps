import React, { useMemo, useCallback } from 'react'
import { Rarity } from '@dcl/schemas'
import { Box } from 'decentraland-ui/dist/components/Box/Box'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { InfoTooltip } from 'decentraland-ui/dist/components/InfoTooltip'
import { useTabletAndBelowMediaQuery } from 'decentraland-ui/dist/components/Media'
import { ArrayFilter } from 'decentraland-ui/dist/components/ArrayFilter'
import { t } from '../../modules/translation/utils'
import { RarityFilterProps } from './RarityFilter.types'

const RarityFilter = ({
  onChange,
  rarities = [],
  className,
  defaultCollapsed = false
}: RarityFilterProps) => {
  const isMobileOrTablet = useTabletAndBelowMediaQuery()
  const rarityOptions = useMemo(() => {
    const options = Object.values(Rarity)
      .filter(value => typeof value === 'string')
      .reverse() as string[]
    return options.map(rarity => ({
      value: rarity,
      text: t(`rarity.${rarity}`)
    }))
  }, [])

  const handleRaritiesChange = useCallback(
    (newValue: string[]) => {
      onChange(newValue as Rarity[])
    },
    [onChange]
  )

  const allRaritiesSelected =
    rarities.length === 0 || rarities.length === rarityOptions.length

  const header = useMemo(
    () => (
      <div className={'dui-rarity-filter__header'}>
        {isMobileOrTablet ? (
          <>
            {t('rarities_filter.title')}
            <Popup
              content={t('rarities_filter.tooltip')}
              position="bottom right"
              trigger={<InfoTooltip />}
              on="hover"
            />
          </>
        ) : (
          <>
            <span className={'dui-rarity-filter__name'}>
              {t('rarities_filter.title')}
            </span>
            <span className="dui-rarity-filter__value">
              {allRaritiesSelected
                ? t('rarities_filter.all_items')
                : t('rarities_filter.count_items', {
                    count: rarities.length
                  })}
            </span>
          </>
        )}
      </div>
    ),
    [rarities, isMobileOrTablet, allRaritiesSelected]
  )

  return (
    <Box
      header={header}
      className={'dui-rarity-filter' + (className ? ' ' + className : '')}
      collapsible
      defaultCollapsed={defaultCollapsed || isMobileOrTablet}
    >
      <ArrayFilter
        options={rarityOptions}
        onChange={handleRaritiesChange}
        values={rarities}
      />
    </Box>
  )
}

export { RarityFilter }
