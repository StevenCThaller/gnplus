import Allegiance from "@api/models/allegiance.model";
import { Service, Inject } from "typedi";
import BaseService, { RepoManager } from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class AllegianceRepository extends BaseService<Allegiance> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
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
