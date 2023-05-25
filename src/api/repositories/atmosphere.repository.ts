import { Atmosphere } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class AtmosphereRepository extends BaseRepository<Atmosphere> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(Atmosphere, dataSource);
  }

  public async findOneOrCreate(atmosphere: string): Promise<Atmosphere> {
    return await super._findOneOrCreate({ atmosphere }, { atmosphere });
  }
}
