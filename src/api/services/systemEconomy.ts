import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import SystemEconomy from "@api/models/systemEconomy";
import Economy from "@api/models/economy";

@Service()
export default class SystemEconomyService extends BaseService<SystemEconomy> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SystemEconomy, dataSource);
  }

  public async createWithEagerLoad(
    primaryEconomy: Economy,
    secondaryEconomy: Economy
  ): Promise<SystemEconomy> {
    const record = this.repository.create({
      primaryEconomy,
      secondaryEconomy
    });
    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreate(
    primaryEconomy: Economy,
    secondaryEconomy: Economy
  ): Promise<SystemEconomy> {
    return super._findOneOrCreate(
      { primaryEconomy, secondaryEconomy },
      { primaryEconomy, secondaryEconomy }
    );
  }
}
