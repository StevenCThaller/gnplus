import Economy from "@api/models/economy.model";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class EconomyRepository extends BaseService<Economy> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Economy, dataSource);
  }

  public async findOneOrCreate(economyName: string): Promise<Economy> {
    const result = await super._findOneOrCreate(
      { economyName },
      { economyName }
    );
    // if (!result.id) await this.repository.save(result);
    return result;
  }
}
