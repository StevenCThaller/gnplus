import { PlanetComposition } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetCompositionRepository extends BaseRepository<PlanetComposition> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetComposition, dataSource);
  }

  public async findOneOrCreate(
    ice: number,
    rock: number,
    metal: number
  ): Promise<PlanetComposition> {
    return await super._findOneOrCreate(
      { ice, rock, metal },
      { ice, rock, metal }
    );
  }
}
