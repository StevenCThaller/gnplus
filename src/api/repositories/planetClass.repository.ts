import { PlanetClass } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetClassRepository extends BaseRepository<PlanetClass> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetClass, dataSource);
  }

  public async findOneOrCreate(planetClass: string): Promise<PlanetClass> {
    return await super._findOneOrCreate({ planetClass }, { planetClass });
  }
}
