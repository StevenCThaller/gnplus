import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { Faction } from "@models/index";

@Service()
export default class FactionService extends DatabaseService<Faction> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, Faction);
    this.repository = this.dataSource.getRepository(Faction);
  }

  public async findOrCreate(factionName: string): Promise<Faction> {
    return this.findOrCreateEntity(Faction, { factionName }, { factionName });
  }
}
