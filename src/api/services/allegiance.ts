import Allegiance from "@api/models/allegiance";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class AllegianceService extends BaseService<Allegiance> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: EntityManager | DataSource
  ) {
    super(Allegiance, dataSource);
  }

  public async findByName(allegiance: string): Promise<Allegiance | null> {
    return this.repository.findOne({ where: { allegiance } });
  }

  public async findOneOrCreate(allegiance: string): Promise<Allegiance> {
    return await super._findOneOrCreate({ allegiance }, { allegiance });
  }
}
