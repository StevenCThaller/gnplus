import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { HappinessLevel } from "@models/index";

@Service()
export default class HappinessLevelService extends DatabaseService<HappinessLevel> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, HappinessLevel);
    this.repository = this.dataSource.getRepository(HappinessLevel);
  }

  public async findOrCreate(happinessLevel: string): Promise<HappinessLevel> {
    return this.findOrCreateEntity(HappinessLevel, { happinessLevel }, { happinessLevel });
  }

  public override async seed(): Promise<void> {
    await super.seed("happiness_levels.json");
  }
}
