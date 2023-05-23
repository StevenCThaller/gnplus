import StarSystem from "@api/models/starSystem.model";
import { Service } from "typedi";
import BaseService from "./base.repository";
import { BaseEntity, DataSource, EntityManager } from "typeorm";
import SystemCoordinates from "@api/models/systemCoordinates.model";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import SystemEconomy from "@api/models/systemEconomy.model";

@Service()
export default class StarSystemRepository extends BaseService<StarSystem> {
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

    record = { ...record, ...data } as StarSystem;
    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreateBase(
    systemAddress: number,
    systemName: string
  ): Promise<StarSystem> {
    return super._findOneOrCreate(
      {
        systemAddress,
        systemName
      },
      {
        systemAddress,
        systemName
      }
    );
  }
}
