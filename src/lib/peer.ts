import { LambdasClient } from 'dcl-catalyst-client'
import { env } from 'decentraland-commons'
import { BaseAPI } from './api'
import { Profile } from '../modules/profile/types'

export enum EntityType {
  SCENE = 'scene',
  WEARABLE = 'wearable',
  PROFILE = 'profile'
}

export type ContentServiceScene = {
  id: string
  type: EntityType
  timestamp: number
  pointers: string[]
  content: string[]
  metadata: any
}[]

export class PeerAPI extends BaseAPI {
  cache: Record<string, Promise<Profile>> = {}
  lambdasClient: LambdasClient

  constructor(url: string) {
    super(url)
    this.lambdasClient = new LambdasClient(`${url}/lambdas`)
  }

  fetchProfile = async (address: string) => {
    if (address in this.cache) {
      return this.cache[address]
    }
    const promise = this.lambdasClient
      .fetchProfiles([address.toLowerCase()])
      .then(profiles => profiles[0])
    this.cache[address] = promise
    return promise
  }

  fetchScene = async (x: number, y: number) => {
    const req = await fetch(
      `${this.url}/content/entities/scene?pointer=${x},${y}`
    )
    const res = await req.json()
    return res as ContentServiceScene
  }
}

export const PEER_URL = env.get('REACT_APP_PEER_URL', '')
export const content = new PeerAPI(PEER_URL)
