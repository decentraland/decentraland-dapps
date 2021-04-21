import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { Personal } from 'web3x-es/personal'
import {
  CatalystClient,
  DeploymentBuilder,
  DeploymentPreparationData
} from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { Authenticator } from 'dcl-crypto'
import { Profile } from '../profile/types'
import { changeProfile } from '../profile/actions'

import { marketplace } from '../../lib/marketplace'
import {
  FETCH_ENS_LIST_REQUEST,
  FetchENSListRequestAction,
  fetchENSListSuccess,
  fetchENSListFailure,
  SET_ALIAS_REQUEST,
  SetAliasRequestAction,
  setAliasSuccess,
  setAliasFailure
} from './actions'
import { ENS, ENSError } from './types'
import {
  getDefaultProfileEntity,
  setProfileFromEntity,
  getEth,
  getWallet
} from './utils'

const PEER_URL = process.env.REACT_APP_PEER_URL || ''

export function* ensSaga() {
  yield takeLatest(SET_ALIAS_REQUEST, handleSetAlias)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
}

function* handleSetAlias(action: SetAliasRequestAction) {
  const { address, name } = action.payload
  try {
    const client = new CatalystClient(PEER_URL, 'builder')
    const entities: Entity[] = yield call(() =>
      client.fetchEntitiesByPointers(EntityType.PROFILE, [
        address.toLowerCase()
      ])
    )
    let entity: Entity
    if (entities.length > 0) {
      entity = entities[0]
    } else {
      entity = yield call(() => getDefaultProfileEntity())
    }

    const avatar = entity && entity.metadata && entity.metadata.avatars[0]
    const newAvatar = {
      ...avatar,
      hasClaimedName: true,
      version: avatar.version + 1,
      name
    }

    const newEntity = {
      ...entity,
      userId: address,
      ethAddress: address,
      metadata: {
        ...entity.metadata,
        avatars: [newAvatar, ...entity.metadata.avatars.slice(1)]
      }
    }
    // Build entity
    const content: Map<string, string> = new Map(
      (newEntity.content || []).map(({ file, hash }) => [file, hash])
    )

    const deployPreparationData: DeploymentPreparationData = yield call(() =>
      DeploymentBuilder.buildEntityWithoutNewFiles(
        EntityType.PROFILE,
        [address],
        content,
        newEntity.metadata
      )
    )

    // Request signature
    const eth: Eth = yield call(getEth)

    const personal = new Personal(eth.provider)
    const signature: string = yield personal.sign(
      deployPreparationData.entityId,
      Address.fromString(address),
      ''
    )

    // Deploy change
    const authChain = Authenticator.createSimpleAuthChain(
      deployPreparationData.entityId,
      address,
      signature
    )
    yield call(() =>
      client.deployEntity({ ...deployPreparationData, authChain })
    )

    const stateEntity: { metadata: Profile } = yield call(() =>
      setProfileFromEntity(newEntity)
    )
    yield put(setAliasSuccess(address, name))
    yield put(changeProfile(address, stateEntity.metadata))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(setAliasFailure(address, ensError))
  }
}

function* handleFetchENSListRequest(_action: FetchENSListRequestAction): any {
  try {
    const data = yield getWallet()
    const address = data[0].address
    const domains: string[] = yield call(() =>
      marketplace.fetchENSList(address)
    )

    const ensList: ENS[] = yield call(() =>
      Promise.all(
        domains.map(async data => {
          const name = data
          const subdomain = `${data.toLowerCase()}.dcl.eth`

          const ens: ENS = {
            address,
            name,
            subdomain,
            resolver: '',
            content: '',
            landId: ''
          }

          return ens
        })
      )
    )

    yield put(fetchENSListSuccess(ensList))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSListFailure(ensError))
  }
}
