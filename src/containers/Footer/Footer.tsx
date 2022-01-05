import * as React from 'react'

import { Footer as FooterComponent, FooterI18N } from 'decentraland-ui/dist/components/Footer/Footer'

import { FooterProps } from './Footer.types'
import { T } from '../../modules/translation/utils'

export default class Footer extends React.PureComponent<FooterProps> {
  getTranslations = (): FooterI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      dropdown: {
        en: <T id="@dapps.footer.dropdown.en" />,
        es: <T id="@dapps.footer.dropdown.es" />,
        fr: <T id="@dapps.footer.dropdown.fr" />,
        ja: <T id="@dapps.footer.dropdown.ja" />,
        zh: <T id="@dapps.footer.dropdown.zh" />,
        ko: <T id="@dapps.footer.dropdown.ko" />
      },
      links: {
        home: <T id="@dapps.footer.links.home" />,
        privacy: <T id="@dapps.footer.links.privacy" />,
        terms: <T id="@dapps.footer.links.terms" />,
        content: <T id="@dapps.footer.links.content" />,
        ethics: <T id="@dapps.footer.links.ethics" />
      }
    }
  }

  handleChange: FooterProps['onChange'] = (_, { value }) => {
    const { locale, onChange } = this.props
    if (value && value !== locale && onChange) {
      onChange(_, { value })
    }
  }

  render() {
    return (
      <FooterComponent
        {...this.props}
        onChange={this.handleChange}
        i18n={this.getTranslations()}
      />
    )
  }
}
