import { AtmosphereType } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class AtmosphereTypeRepository extends BaseRepository<AtmosphereType> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(AtmosphereType, dataSource);
  }

  public async findOneOrCreate(
    atmosphereType: string
  ): Promise<AtmosphereType> {
    return await super._findOneOrCreate({ atmosphereType }, { atmosphereType });
  }
}
