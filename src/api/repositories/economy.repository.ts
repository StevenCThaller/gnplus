import { Economy } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class EconomyRepository extends BaseRepository<Economy> {
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
