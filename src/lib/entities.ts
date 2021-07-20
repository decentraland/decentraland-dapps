import { Authenticator, AuthChain } from 'dcl-crypto'
import { Personal } from 'web3x-es/personal'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import {
  CatalystClient,
  DeploymentBuilder,
  DeploymentPreparationData
} from 'dcl-catalyst-client'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { getEthereumProvider } from './eth'
import { ProfileEntity } from './types'
import { PeerAPI } from './peer'

export class EntitesOperations {
  private readonly catalystClient: CatalystClient
  private readonly peerAPI: PeerAPI

  constructor(peerUrl: string) {
    this.catalystClient = new CatalystClient(peerUrl, 'builder')
    this.peerAPI = new PeerAPI(peerUrl)
  }

  /**
   * Builds the entity deployment preparation data.
   *
   * @param {Entity} entity - The entity that will be pre-processed prior to its deployment.
   * @param {EntityType} type - The entity type that will be prepared to be deployed.
   * @param {string} address - The address of the owner of the entity to be deployed.
   */
  private async buildDeployPreparationData(
    entity: Entity,
    type: EntityType,
    address: string
  ): Promise<DeploymentPreparationData> {
    const content: Map<string, string> = new Map(
      (entity.content || []).map(({ file, hash }) => [file, hash])
    )

    return DeploymentBuilder.buildEntityWithoutNewFiles(
      type,
      [address],
      content,
      entity.metadata
    )
  }

  /**
   * Uses the provider to request the user for a signature to
   * deploy an entity.
   *
   * @param {string} address - The address of the deployer of the entity.
   * @param {string} entityId - The entity id that it's going to be deployed.
   */
  private async authenticateEntityDeployment(
    address: string,
    entityId: string
  ): Promise<AuthChain> {
    const eth: Eth = await getEthereumProvider()

    const personal = new Personal(eth.provider)
    const signature = await personal.sign(
      entityId,
      Address.fromString(address),
      ''
    )
    // Create an auth chain
    return Authenticator.createSimpleAuthChain(entityId, address, signature)
  }

  /**
   * Gets the first {@link ProfileEntity} out of multiple possible profile entities or
   * returns the last one in case the given address has no profile entities.
   *
   * @param {string} address - The address that owns the profile entity being retrieved.
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
   * @param {Entity} entity - The title of the book.
   * @param {EntityType} entityType - The type of the entity.
   * @param {string} address - The owner / soon to be owner of the entity.
   */
  async deployEntity(
    entity: Entity,
    entityType: EntityType,
    address: string
  ): Promise<any> {
    const deployPreparationData: DeploymentPreparationData = await this.buildDeployPreparationData(
      entity,
      entityType,
      address
    )

    const authChain: AuthChain = await this.authenticateEntityDeployment(
      address,
      deployPreparationData.entityId
    )

    return this.catalystClient.deployEntity({
      ...deployPreparationData,
      authChain
    })
  }
}
