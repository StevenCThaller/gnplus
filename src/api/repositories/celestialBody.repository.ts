import { BodyType, CelestialBody } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class CelestialBodyRepository extends BaseRepository<CelestialBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(CelestialBody, dataSource);
  }

  public async findOneOrCreate(
    bodyId: number,
    systemAddress: number,
    bodyName: string,
    distanceFromArrival: number,
    bodyType: BodyType
  ): Promise<CelestialBody> {
    return super._findOneOrCreate(
      { bodyId, systemAddress },
      { bodyId, systemAddress, bodyName, distanceFromArrival, bodyType }
    );
  }
}
