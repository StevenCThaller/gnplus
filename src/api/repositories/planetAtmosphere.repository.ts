import { PlanetAtmosphere } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetAtmosphereRepository extends BaseRepository<PlanetAtmosphere> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetAtmosphere, dataSource);
  }

  public async findOneOrCreate(
    planetAtmosphere: OmitBaseEntity<PlanetAtmosphere>
  ): Promise<PlanetAtmosphere> {
    const { bodyId, systemAddress } = planetAtmosphere;
    return await super._findOneOrCreate(
      { bodyId, systemAddress },
      planetAtmosphere
    );
  }
}
