import { PlanetaryBody } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetaryBodyRepository extends BaseRepository<PlanetaryBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetaryBody, dataSource);
  }

  public async findByName(
    planetaryBody: string
  ): Promise<PlanetaryBody | null> {
    return this.repository.findOne({ where: { planetaryBody } });
  }

  public async findOneOrCreate(planetaryBody: string): Promise<PlanetaryBody> {
    return await super._findOneOrCreate({ planetaryBody }, { planetaryBody });
  }
}
