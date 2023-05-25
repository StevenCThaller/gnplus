import { HappinessLevel } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class HappinessLevelRepository extends BaseRepository<HappinessLevel> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(HappinessLevel, dataSource);
  }

  public async findByName(
    happinessLevel: string
  ): Promise<HappinessLevel | null> {
    return this.repository.findOne({ where: { happinessLevel } });
  }

  public async findOneOrCreate(
    happinessLevel: string
  ): Promise<HappinessLevel> {
    return await super._findOneOrCreate({ happinessLevel }, { happinessLevel });
  }
}
