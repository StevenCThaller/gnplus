import { PlanetarySurfaceDetails } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetarySurfaceDetailsRepository extends BaseRepository<PlanetarySurfaceDetails> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetarySurfaceDetails, dataSource);
  }

  public async findOneOrCreate(
    surfaceDetails: SurfaceDetailsParams
  ): Promise<PlanetarySurfaceDetails> {
    const { bodyId, systemAddress } = surfaceDetails;
    return await super._findOneOrCreate(
      { bodyId, systemAddress },
      surfaceDetails
    );
  }
}
