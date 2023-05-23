import StationType from "@api/models/stationType.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StationTypeRepository extends BaseRepository<StationType> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: EntityManager | DataSource
  ) {
    super(StationType, dataSource);
  }

  public async findOneOrCreate(stationType: string): Promise<StationType> {
    return super._findOneOrCreate({ stationType }, { stationType });
  }
}
