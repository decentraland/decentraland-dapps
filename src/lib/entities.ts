import { ethers } from 'ethers'
import { Authenticator, AuthChain } from '@dcl/crypto'
import { Entity, EntityType } from '@dcl/schemas/dist/platform/entity'
import { createCatalystClient } from 'dcl-catalyst-client/dist/client/CatalystClient'
import { ContentClient } from 'dcl-catalyst-client/dist/client/ContentClient'
import { BuildEntityWithoutFilesOptions } from 'dcl-catalyst-client/dist/client/types'
import { getConnectedProvider } from './eth'
import { ProfileEntity } from './types'
import { PeerAPI } from './peer'
import { createFetchComponent } from '@well-known-components/fetch-component'
import { buildEntityWithoutNewFiles } from 'dcl-catalyst-client/dist/client/utils/DeploymentBuilder'

export async function createEntitiesOperator(peerUrl: string, peerWithNoGbCollectorUrl?: string): Promise<EntitiesOperator> {
  const catalystClient = await createCatalystClient({ url: peerUrl, fetcher: createFetchComponent() })
  const catalystContentClient = await catalystClient.getContentClient()

  const catalystClientWithoutGbCollector = 
    peerWithNoGbCollectorUrl ? 
    await createCatalystClient({  url: peerWithNoGbCollectorUrl, fetcher: createFetchComponent() }) 
    : null
  const catalystContentClientWithoutGbCollector = 
    catalystClientWithoutGbCollector ?  
    await catalystClientWithoutGbCollector.getContentClient() 
    : null


  return new EntitiesOperator(
    catalystContentClient, 
    catalystContentClientWithoutGbCollector, 
    new PeerAPI(peerUrl),
    peerUrl,
    peerWithNoGbCollectorUrl
  )
}

export class EntitiesOperator {
  constructor(
    private readonly catalystContentClient: ContentClient,
    // this is a temporal work-around to fix profile deployment issues on catalysts with Garbage Collector
    private readonly catalystContentClientWithoutGbCollector: ContentClient | null,
    private readonly peerAPI: PeerAPI,
    private readonly peerUrl: string, 
    private readonly peerWithNoGbCollectorUrl?: string
    ) {}

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

    const catalystClient = this.catalystContentClientWithoutGbCollector ?? this.catalystContentClient
    const catalystUrl = this.peerWithNoGbCollectorUrl ?? this.peerUrl

    const entityToDeploy = await buildEntityWithoutNewFiles(createFetchComponent(), { contentUrl: catalystUrl, ...options  });

    const authChain: AuthChain = await this.authenticateEntityDeployment(
      address,
      entityToDeploy.entityId
    )

    return catalystClient.deploy({
      ...entityToDeploy,
      authChain
    })
  }
}