import { Authenticator, AuthChain } from 'dcl-crypto'
import { Personal } from 'web3x/personal'
import { Eth } from 'web3x/eth'
import { Address } from 'web3x/address'
import {
  CatalystClient,
  BuildEntityWithoutFilesOptions
} from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { getConnectedProvider } from './eth'
import { ProfileEntity } from './types'
import { PeerAPI } from './peer'

export class EntitiesOperator {
  private readonly catalystClient: CatalystClient
  private readonly peerAPI: PeerAPI

  constructor(peerUrl: string) {
    this.catalystClient = new CatalystClient({ catalystUrl: peerUrl })
    this.peerAPI = new PeerAPI(peerUrl)
  }

  /**
   * Uses the provider to request the user for a signature to
   * deploy an entity.
   *
   * @param address - The address of the deployer of the entity.
   * @param entityId - The entity id that it's going to be deployed.
   */
  private async authenticateEntityDeployment(
    address: string,
    entityId: string
  ): Promise<AuthChain> {
    const provider = await getConnectedProvider()
    if (!provider)
      throw new Error(
        "The provider couldn't be retrieved when creating the auth chain"
      )
    const eth = new Eth(provider)

    const personal = new Personal(eth.provider)
    const signature = await personal.sign(
      entityId,
      Address.fromString(address),
      ''
    )

    return Authenticator.createSimpleAuthChain(entityId, address, signature)
  }

  /**
   * Gets the first {@link ProfileEntity} out of multiple possible profile entities or
   * returns the last one in case the given address has no profile entities.
   *
   * @param address - The address that owns the profile entity being retrieved.
   */
  async getProfileEntity(address: string): Promise<ProfileEntity> {
    const entities: Entity[] = await this.catalystClient.fetchEntitiesByPointers(
      EntityType.PROFILE,
      [address.toLowerCase()]
    )

    if (entities.length > 0) {
      return entities[0] as ProfileEntity
    }

    return this.peerAPI.getDefaultProfileEntity()
  }

  /**
   * Deploys an entity of a determined type.
   * This method will build everything related to the deployment of
   * the entity and will prompt the user for their signature before
   * doing a deployment.
   *
   * @param entity - The title of the book.
   * @param entityType - The type of the entity.
   * @param address - The owner / soon to be owner of the entity.
   */
  async deployEntityWithoutNewFiles(
    entity: Entity,
    entityType: EntityType,
    address: string
  ): Promise<any> {
    const options: BuildEntityWithoutFilesOptions = {
      type: entityType,
      pointers: [address],
      metadata: entity.metadata,
      timestamp: Date.now()
    }

    const entityToDeploy = await this.catalystClient.buildEntityWithoutNewFiles(
      options
    )

    const authChain: AuthChain = await this.authenticateEntityDeployment(
      address,
      entityToDeploy.entityId
    )

    return this.catalystClient.deployEntity({
      ...entityToDeploy,
      authChain
    })
  }
}
