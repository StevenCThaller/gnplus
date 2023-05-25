import StarSystem from "@api/models/starSystem.model";
import { Service } from "typedi";
import BaseRepository from "./base.repository";
import { BaseEntity, DataSource, EntityManager } from "typeorm";
import SystemCoordinates from "@api/models/systemCoordinates.model";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import SystemEconomy from "@api/models/systemEconomy.model";

@Service()
export default class StarSystemRepository extends BaseRepository<StarSystem> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(StarSystem, dataSource);
  }

  public async findBySystemAddress(
    systemAddress: number
  ): Promise<StarSystem | null> {
    return this.repository.findOne({ where: { systemAddress } });
  }

  public async updateOneOrCreate(
    data: OmitBaseEntity<StarSystem>
  ): Promise<StarSystem> {
    const { systemAddress } = data;
    let record: StarSystem | null = await this.repository.findOne({
      where: { systemAddress }
    });

    if (!record) return this.repository.create(data);

    record.government = data.government;
    record.allegiance = data.allegiance;
    record.population = data.population;
    record.systemEconomy = data.systemEconomy;
    record.primaryFaction = data.primaryFaction;
    record.securityLevel = data.securityLevel;
    record.powerplayState = data.powerplayState;
    record.systemPowers = data.systemPowers;
    record.thargoidWar = data.thargoidWar;
    record.systemConflicts = data.systemConflicts;

    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreateBase(
    systemAddress: number,
    systemName: string,
    systemCoordinates: SystemCoordinates
  ): Promise<StarSystem> {
    return super._findOneOrCreate(
      {
        systemAddress
      },
      {
        systemAddress,
        systemName,
        systemCoordinates
      }
    );
  }
}
