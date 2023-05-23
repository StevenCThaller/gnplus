import StationEconomy from "@api/models/stationEconomy.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StationEconomyRepository extends BaseRepository<StationEconomy> {
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
