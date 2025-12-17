import { SmartWearableFilter as SmartWearableFilterUI } from 'decentraland-ui/dist/components/SmartWearableFilter'
import { t } from '../../modules/translation/utils'
import { SmartWearableFilterProps } from './SmartWearableFilter.types'

export const SmartWearableFilter = (props: SmartWearableFilterProps) => {
  const i18n = {
    title: t('@dapps.smart_wearables_filter.title'),
    selected: t('@dapps.smart_wearables_filter.selected')
  }

  return <SmartWearableFilterUI i18n={i18n} {...props} />
}
