import { AtmosphereComposition, AtmosphereType } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class AtmosphereCompositionRepository extends BaseRepository<AtmosphereComposition> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(AtmosphereComposition, dataSource);
  }

  public async findOneOrCreate(
    planetAtmosphereId: number,
    bodyId: number,
    systemAddress: number,
    atmosphereType: AtmosphereType,
    percent: number
  ): Promise<AtmosphereComposition> {
    return await super._findOneOrCreate(
      { bodyId, systemAddress, atmosphereTypeId: atmosphereType.id },
      {
        bodyId,
        systemAddress,
        atmosphereTypeId: atmosphereType.id,
        planetAtmosphereId,
        percent
      }
    );
  }
}
