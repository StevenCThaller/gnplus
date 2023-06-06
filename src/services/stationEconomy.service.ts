import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { Economy, StationEconomy } from "@models/index";
import { DataSource, EntityManager } from "typeorm";
import EconomyService from "./economy.service";

@Service()
export default class StationEconomyService extends DatabaseService<StationEconomy> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, StationEconomy);
    this.repository = this.dataSource.getRepository(StationEconomy);
  }

  public async findOrCreate(stationEconomy: StationEconomyParams): Promise<StationEconomy> {
    const { economy: name, proportion } = stationEconomy;
    const economy: Economy = await this.getService(EconomyService).findOrCreate(name);
    const record: StationEconomy = await this.findOrCreateEntity(
      StationEconomy,
      { stationId: stationEconomy.stationId, economyId: economy.id },
      { stationId: stationEconomy.stationId, economy, proportion }
    );
    if (!record.hasId()) await this.repository.save(record);
    return record;
  }
}
