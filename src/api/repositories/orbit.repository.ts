import { Orbit } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class OrbitRepository extends BaseRepository<Orbit> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(Orbit, dataSource);
  }

  public async findOneOrCreate(
    bodyId: number,
    systemAddress: number,
    semiMajorAxis: number,
    orbitalInclination: number,
    orbitalPeriod: number,
    eccentricity: number,
    periapsis: number,
    parentBodyId: number
  ): Promise<Orbit> {
    return super._findOneOrCreate(
      { bodyId, systemAddress },
      {
        bodyId,
        systemAddress,
        semiMajorAxis,
        orbitalInclination,
        orbitalPeriod,
        eccentricity,
        periapsis,
        parentBodyId
      }
    );
  }
}
