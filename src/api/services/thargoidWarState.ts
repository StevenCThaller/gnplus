import Allegiance from "@api/models/allegiance";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import ThargoidWarState from "@api/models/thargoidWarState";

@Service()
export default class ThargoidWarStateService extends BaseService<ThargoidWarState> {
  /**
   *
   */
  constructor(protected dataSource: DataSource | EntityManager) {
    super(ThargoidWarState, dataSource);
  }

  public async findOneOrCreate(warState: string): Promise<ThargoidWarState> {
    const record = await super._findOneOrCreate({ warState }, { warState });

    if (!record.id) await this.repository.save(record);
    return record;
  }
}
