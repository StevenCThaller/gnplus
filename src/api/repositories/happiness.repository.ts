import HappinessLevel from "@api/models/happiness.model";
import { Service } from "typedi";
import BaseService from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class HappinessRepository extends BaseService<HappinessLevel> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(HappinessLevel, dataSource);
  }

  public async findOneOrCreate(happiness: string): Promise<HappinessLevel> {
    return super._findOneOrCreate({ happiness }, { happiness });
  }
}
