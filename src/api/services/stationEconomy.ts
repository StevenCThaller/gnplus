import StationEconomy from "@api/models/stationEconomy";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StationEconomyService extends BaseService<StationEconomy> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(StationEconomy, dataSource);
  }

  public async findOneOrCreate(
    stationId: number,
    economyId: number,
    proportion: number
  ): Promise<StationEconomy> {
    return super._findOneOrCreate(
      { stationId, economyId },
      { stationId, economyId, proportion }
    );
  }
}
