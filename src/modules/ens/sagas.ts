import { Eth, SendTx } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { TransactionReceipt } from 'web3x-es/formatters'
import { Personal } from 'web3x-es/personal'
import { namehash } from '@ethersproject/hash'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
import { CatalystClient, DeploymentBuilder } from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { Avatar } from 'decentraland-ui'
import { Authenticator } from 'dcl-crypto'

import { ENS as ENSContract } from '../../contracts/ENS'
import { ENSResolver } from '../../contracts/ENSResolver'
import { DCLController } from '../../contracts/DCLController'
import { ERC20 as MANAToken } from '../../contracts/ERC20'

import { marketplace } from '../../lib/marketplace'
import { ipfs } from '../../lib/ipfs'
import { PEER_URL } from '../../lib/peer'

import { Profile } from '../profile/types'
import { changeProfile } from '../profile/actions'
import { Wallet } from '../wallet/types'

import { getData as getBaseWallet } from '../wallet/selectors'

import {
  FETCH_ENS_REQUEST,
  FetchENSRequestAction,
  fetchENSSuccess,
  fetchENSFailure,
  SET_ENS_CONTENT_REQUEST,
  SetENSContentRequestAction,
  setENSContentSuccess,
  setENSContentFailure,
  SET_ENS_RESOLVER_REQUEST,
  SetENSResolverRequestAction,
  setENSResolverSuccess,
  setENSResolverFailure,
  FETCH_ENS_AUTHORIZATION_REQUEST,
  FetchENSAuthorizationRequestAction,
  fetchENSAuthorizationSuccess,
  fetchENSAuthorizationFailure,
  FETCH_ENS_LIST_REQUEST,
  FetchENSListRequestAction,
  fetchENSListSuccess,
  fetchENSListFailure,
  SET_ALIAS_REQUEST,
  SetAliasRequestAction,
  setAliasSuccess,
  setAliasFailure,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  claimNameSuccess,
  claimNameFailure,
  ALLOW_CLAIM_MANA_REQUEST,
  AllowClaimManaRequestAction,
  allowClaimManaSuccess,
  allowClaimManaFailure
} from './actions'
import { ENS, ENSOrigin, ENSError, Authorization } from './types'
import { createEnsUtils, getEth, getDomainFromName } from './utils'

export function* getWallet() {
  const eth: Eth = yield call(getEth)

  const wallet: Wallet | null = yield select(getBaseWallet)
  if (!wallet) {
    throw new Error('Could not get current wallet from state')
  }

  return [wallet, eth]
}

export function createEnsSaga({
  ensContractAddress,
  ensResolverContractAddress,
  ensControllerContractAdress,
  manaContractAddress,
  registrarContractAddress,
  peerUrl,
  getLands
}: {
  ensControllerContractAdress: string
  ensContractAddress: string
  ensResolverContractAddress: string
  manaContractAddress: string
  registrarContractAddress: string
  peerUrl: string
  getLands: any
}) {
  function* ensSaga() {
    yield takeLatest(SET_ALIAS_REQUEST, handleSetAlias)
    yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
    yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
    yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
    yield takeEvery(
      FETCH_ENS_AUTHORIZATION_REQUEST,
      handleFetchAuthorizationRequest
    )
    yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
    yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
    yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)
  }

  const { getDefaultProfileEntity, setProfileFromEntity } = createEnsUtils({
    peerUrl,
    registrarContractAddress
  })

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
      const newAvatar: Avatar = {
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

      const deployPreparationData = yield call(() =>
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
      const signature = yield personal.sign(
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

      const stateEntity = yield call(() => setProfileFromEntity(newEntity))
      yield put(setAliasSuccess(address, name))
      yield put(changeProfile(address, stateEntity.metadata as Profile))
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(setAliasFailure(address, ensError))
    }
  }

  function* handleFetchENSRequest(action: FetchENSRequestAction) {
    const { name, land } = action.payload
    const subdomain = name.toLowerCase() + '.dcl.eth'
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const address = wallet.address
      const nodehash = namehash(subdomain)
      const ensContract = new ENSContract(
        eth,
        Address.fromString(ensContractAddress)
      )

      const resolverAddress: Address = yield call(() =>
        ensContract.methods.resolver(nodehash).call()
      )

      if (resolverAddress.toString() === Address.ZERO.toString()) {
        return yield put(
          fetchENSSuccess({
            name,
            address,
            subdomain,
            resolver: Address.ZERO.toString(),
            content: Address.ZERO.toString()
          })
        )
      }

      const resolverContract = new ENSResolver(eth, resolverAddress)
      const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
      const landHash = contentHash.fromIpfs(ipfsHash)

      const currentContent = yield call(() =>
        resolverContract.methods.contenthash(nodehash).call()
      )
      if (currentContent === Address.ZERO.toString()) {
        return yield put(
          fetchENSSuccess({
            address,
            name,
            subdomain,
            resolver: resolverAddress.toString(),
            content: Address.ZERO.toString(),
            ipfsHash
          })
        )
      }

      if (`0x${landHash}` === currentContent) {
        return yield put(
          fetchENSSuccess({
            address,
            name,
            subdomain,
            resolver: ensResolverContractAddress,
            content: landHash,
            ipfsHash,
            landId: land.id
          })
        )
      }

      yield put(
        fetchENSSuccess({
          address,
          name,
          subdomain,
          resolver: ensResolverContractAddress,
          content: currentContent || Address.ZERO.toString(),
          landId: ''
        })
      )
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(fetchENSFailure(ensError))
    }
  }

  function* handleSetENSResolverRequest(action: SetENSResolverRequestAction) {
    const { ens } = action.payload
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const from = Address.fromString(wallet.address)
      const nodehash = namehash(ens.subdomain)
      const ensContract = new ENSContract(
        eth,
        Address.fromString(ensContractAddress)
      )

      const txHash = yield call(() =>
        ensContract.methods
          .setResolver(nodehash, Address.fromString(ensResolverContractAddress))
          .send({ from })
          .getTxHash()
      )
      yield put(
        setENSResolverSuccess(
          ens,
          ensResolverContractAddress,
          from.toString(),
          wallet.chainId,
          txHash
        )
      )
    } catch (error) {
      const ensError: ENSError = {
        message: error.message,
        code: error.code,
        origin: ENSOrigin.RESOLVER
      }
      yield put(setENSResolverFailure(ens, ensError))
    }
  }

  function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
    const { ens, land } = action.payload
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const from = Address.fromString(wallet.address)

      let content = ''

      if (land) {
        const ipfsHash = yield call(() => ipfs.uploadRedirectionFile(land))
        content = `0x${contentHash.fromIpfs(ipfsHash)}`
      } else {
        content = Address.ZERO.toString()
      }

      const nodehash = namehash(ens.subdomain)
      const resolverContract = new ENSResolver(
        eth,
        Address.fromString(ensResolverContractAddress)
      )

      const txHash = yield call(() =>
        resolverContract.methods
          .setContenthash(nodehash, content)
          .send({ from })
          .getTxHash()
      )

      yield put(
        setENSContentSuccess(
          ens,
          content,
          land,
          from.toString(),
          wallet.chainId,
          txHash
        )
      )
    } catch (error) {
      console.log(error)
      const ensError: ENSError = {
        message: error.message,
        code: error.code,
        origin: ENSOrigin.CONTENT
      }
      yield put(setENSContentFailure(ens, land, ensError))
    }
  }

  function* handleFetchAuthorizationRequest(
    _action: FetchENSAuthorizationRequestAction
  ) {
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const from = Address.fromString(wallet.address)
      const manaContract = new MANAToken(
        eth,
        Address.fromString(manaContractAddress)
      )
      const allowance: string = yield call(() =>
        manaContract.methods
          .allowance(from, Address.fromString(ensControllerContractAdress))
          .call()
      )
      const authorization: Authorization = { allowance }

      yield put(fetchENSAuthorizationSuccess(authorization, from.toString()))
    } catch (error) {
      const allowError: ENSError = { message: error.message }
      yield put(fetchENSAuthorizationFailure(allowError))
    }
  }

  function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
    try {
      const landHashes: { id: string; hash: string }[] = []
      const lands = yield select(getLands)

      for (let land of lands) {
        const landHash = yield call(() => ipfs.computeLandHash(land))
        landHashes.push({ hash: `0x${landHash}`, id: land.id })
      }

      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const address = wallet.address
      const ensContract = new ENSContract(
        eth,
        Address.fromString(ensContractAddress)
      )
      const domains: string[] = yield call(() =>
        marketplace.fetchENSList(address)
      )

      const ensList: ENS[] = yield call(() =>
        Promise.all(
          domains.map(async data => {
            const name = data
            const subdomain = `${data.toLowerCase()}.dcl.eth`
            let landId: string | undefined = undefined
            let content: string = ''

            const nodehash = namehash(subdomain)
            const resolverAddress: Address = await ensContract.methods
              .resolver(nodehash)
              .call()
            const resolver = resolverAddress.toString()

            if (resolver !== Address.ZERO.toString()) {
              const resolverContract = new ENSResolver(eth, resolverAddress)
              content = await resolverContract.methods
                .contenthash(nodehash)
                .call()

              const land = landHashes.find(lh => lh.hash === content)
              if (land) {
                landId = land.id
              }
            }

            const ens: ENS = {
              address,
              name,
              subdomain,
              resolver,
              content,
              landId
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

  function* handleClaimNameRequest(action: ClaimNameRequestAction) {
    const { name } = action.payload
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const from = Address.fromString(wallet.address)

      const controllerContract = new DCLController(
        eth,
        Address.fromString(ensControllerContractAdress)
      )
      const tx: SendTx<TransactionReceipt> = yield call(() =>
        controllerContract.methods.register(name, from).send({ from })
      )
      const txHash: string = yield call(() => tx.getTxHash())

      const ens: ENS = {
        address: wallet.address,
        name: name,
        subdomain: getDomainFromName(name),
        resolver: Address.ZERO.toString(),
        content: Address.ZERO.toString()
      }
      yield put(
        claimNameSuccess(ens, name, wallet.address, wallet.chainId, txHash)
      )
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(claimNameFailure(ensError))
    }
  }

  function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
    const { allowance } = action.payload
    try {
      const [wallet, eth]: [Wallet, Eth] = yield getWallet()
      const from = Address.fromString(wallet.address)
      const manaContract = new MANAToken(
        eth,
        Address.fromString(manaContractAddress)
      )

      const txHash: string = yield call(() =>
        manaContract.methods
          .approve(Address.fromString(ensControllerContractAdress), allowance)
          .send({ from })
          .getTxHash()
      )

      yield put(
        allowClaimManaSuccess(
          allowance,
          from.toString(),
          wallet.chainId,
          txHash
        )
      )
    } catch (error) {
      const ensError: ENSError = { message: error.message }
      yield put(allowClaimManaFailure(ensError))
    }
  }
  return ensSaga
}
