import { connect } from 'react-redux'

import App from './App'
import { MapStateProps, AppProps } from './App.types'
import { isRoot } from '../../modules/location/selectors'

const mapState = (state: any): MapStateProps => {
  return {
    isHomePage: isRoot(state)
  }
}

const mapDispatch = () => ({})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: object,
  ownProps: AppProps
) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(App) as any
