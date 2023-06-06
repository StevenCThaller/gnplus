import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { Economy } from "@models/index";

@Service()
export default class EconomyService extends DatabaseService<Economy> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, Economy);
    this.repository = this.dataSource.getRepository(Economy);
  }

  public async findOrCreate(economyName: string): Promise<Economy> {
    return this.findOrCreateEntity(Economy, { economyName }, { economyName });
  }

  public override async seed(): Promise<void> {
    await super.seed("economies.json");
  }
}
