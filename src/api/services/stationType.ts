import StationType from "@api/models/stationType";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StationTypeService extends BaseService<StationType> {
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
