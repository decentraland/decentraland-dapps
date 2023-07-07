import { ethers } from 'ethers'
import { Authenticator, AuthChain } from '@dcl/crypto'
import { Entity, EntityType } from '@dcl/schemas/dist/platform/entity'
import { ContentClient, createContentClient } from 'dcl-catalyst-client/dist/client/ContentClient'
import { BuildEntityWithoutFilesOptions } from 'dcl-catalyst-client/dist/client/types'
import { buildEntityWithoutNewFiles } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'
import { getConnectedProvider } from './eth'
import { ProfileEntity } from './types'
import { PeerAPI } from './peer'
import { createFetchComponent } from '@well-known-components/fetch-component'

export class EntitiesOperator {
  private catalystContentClient: ContentClient // Undefined until initialization
  // this is a temporal work-around to fix profile deployment issues on catalysts with Garbage Collector
  private catalystContentClientWithoutGbCollector: ContentClient | null // Undefined until initialization
  private readonly peerAPI: PeerAPI

  constructor(private peerUrl: string, private peerWithNoGbCollectorUrl?: string) {
    this.catalystContentClient = createContentClient({ url: `${peerUrl}/content`, fetcher: createFetchComponent() })
    this.catalystContentClientWithoutGbCollector = peerWithNoGbCollectorUrl
      ? createContentClient({ url: `${peerUrl}/content`, fetcher: createFetchComponent() })
      : null
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
    const eth = new ethers.providers.Web3Provider(provider)

    const personal = eth.getSigner(address)
    const signature = await personal.signMessage(entityId)

    return Authenticator.createSimpleAuthChain(entityId, address, signature)
  }

  /**
   * Gets the first {@link ProfileEntity} out of multiple possible profile entities or
   * returns the last one in case the given address has no profile entities.
   *
   * @param address - The address that owns the profile entity being retrieved.
   */
  async getProfileEntity(address: string): Promise<ProfileEntity> {
    const entities: Entity[] = await this.catalystContentClient.fetchEntitiesByPointers(
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
    entityMetadata: Entity['metadata'],
    hashesByKey: Map<string, string>,
    entityType: EntityType,
    pointer: string,
    address: string
  ): Promise<any> {
    const options: BuildEntityWithoutFilesOptions = {
      type: entityType,
      pointers: [pointer],
      metadata: entityMetadata,
      hashesByKey,
      timestamp: Date.now()
    }

    const catalystContentClient = this.catalystContentClientWithoutGbCollector ?? this.catalystContentClient
    const contentUrl = this.peerWithNoGbCollectorUrl ?? this.peerUrl

    const entityToDeploy = await buildEntityWithoutNewFiles(createFetchComponent(), { contentUrl: `${contentUrl}/content`, ...options  })

    const authChain: AuthChain = await this.authenticateEntityDeployment(
      address,
      entityToDeploy.entityId
    )

    return catalystContentClient.deploy({
      ...entityToDeploy,
      authChain
    })
  }
}
