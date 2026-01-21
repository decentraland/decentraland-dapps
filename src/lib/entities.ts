import {
  ContentClient,
  createContentClient,
} from "dcl-catalyst-client/dist/client/ContentClient";
import { BuildEntityWithoutFilesOptions } from "dcl-catalyst-client/dist/client/types";
import { buildEntityWithoutNewFiles } from "dcl-catalyst-client/dist/client/utils/DeploymentBuilder";
import { AuthIdentity, Authenticator } from "@dcl/crypto";
import { Entity, EntityType } from "@dcl/schemas/dist/platform/entity";
import { fetcher } from "./fetcher";
import { PeerAPI } from "./peer";
import { ProfileEntity } from "./types";

export class EntitiesOperator {
  private catalystContentClient: ContentClient; // Undefined until initialization
  // this is a temporal work-around to fix profile deployment issues on catalysts with Garbage Collector
  private catalystContentClientWithoutGbCollector: ContentClient | null; // Undefined until initialization
  private readonly peerAPI: PeerAPI;

  constructor(
    private peerUrl: string,
    private peerWithNoGbCollectorUrl?: string,
  ) {
    this.catalystContentClient = createContentClient({
      url: `${peerUrl}/content`,
      fetcher,
    });
    this.catalystContentClientWithoutGbCollector = peerWithNoGbCollectorUrl
      ? createContentClient({
          url: `${peerUrl}/content`,
          fetcher,
        })
      : null;
    this.peerAPI = new PeerAPI(peerUrl);
  }

  /**
   * Gets the first {@link ProfileEntity} out of multiple possible profile entities or
   * returns the last one in case the given address has no profile entities.
   *
   * @param address - The address that owns the profile entity being retrieved.
   */
  async getProfileEntity(address: string): Promise<ProfileEntity> {
    const entities: Entity[] =
      await this.catalystContentClient.fetchEntitiesByPointers([
        address.toLowerCase(),
      ]);

    if (entities.length > 0) {
      return entities[0] as ProfileEntity;
    }

    return this.peerAPI.getDefaultProfileEntity();
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
    entityMetadata: Entity["metadata"],
    hashesByKey: Map<string, string>,
    entityType: EntityType,
    pointer: string,
    identity: AuthIdentity,
  ): Promise<any> {
    const options: BuildEntityWithoutFilesOptions = {
      type: entityType,
      pointers: [pointer],
      metadata: entityMetadata,
      hashesByKey,
      timestamp: Date.now(),
    };

    const catalystContentClient =
      this.catalystContentClientWithoutGbCollector ??
      this.catalystContentClient;
    const contentUrl = this.peerWithNoGbCollectorUrl ?? this.peerUrl;

    const entityToDeploy = await buildEntityWithoutNewFiles(fetcher, {
      contentUrl: `${contentUrl}/content`,
      ...options,
    });

    const authChain = Authenticator.signPayload(
      identity,
      entityToDeploy.entityId,
    );

    return catalystContentClient.deploy({
      ...entityToDeploy,
      authChain,
    });
  }
}
