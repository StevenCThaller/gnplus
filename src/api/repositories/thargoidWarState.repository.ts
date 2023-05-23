import Allegiance from "@api/models/allegiance.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import ThargoidWarState from "@api/models/thargoidWarState.model";

@Service()
export default class ThargoidWarStateRepository extends BaseRepository<ThargoidWarState> {
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
