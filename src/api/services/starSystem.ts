import StarSystem from "@api/models/starSystem";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StarSystemService extends BaseService<StarSystem> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(StarSystem, dataSource);
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
