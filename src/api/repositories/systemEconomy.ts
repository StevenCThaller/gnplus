import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import SystemEconomy from "@api/models/systemEconomy.model";
import Economy from "@api/models/economy.model";

@Service()
export default class SystemEconomyRepository extends BaseService<SystemEconomy> {
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
    return record;
  }

  public async findOneOrCreate(
    systemEconomy: SystemEconomy
  ): Promise<SystemEconomy> {
    const { primaryEconomy, secondaryEconomy } = systemEconomy;
    if (!primaryEconomy || !secondaryEconomy) throw new Error("no");
    return super._findOneOrCreate(
      {
        primaryEconomyId: primaryEconomy.id,
        secondaryEconomyId: secondaryEconomy.id
      },
      {
        primaryEconomy,
        secondaryEconomy
      }
    );
  }
}
