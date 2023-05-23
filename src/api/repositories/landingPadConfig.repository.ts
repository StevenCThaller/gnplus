import LandingPadConfig from "@api/models/landingPadConfig.model";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class LandingPadConfigRepository extends BaseService<LandingPadConfig> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(LandingPadConfig, dataSource);
  }

  public async findOneOrCreate(
    small: number,
    medium: number,
    large: number
  ): Promise<LandingPadConfig> {
    const result = await super._findOneOrCreate(
      { small, medium, large },
      { small, medium, large }
    );

    if (!result.id) await this.repository.save(result);
    return result;
  }
}
