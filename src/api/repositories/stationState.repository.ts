import StationState from "@api/models/stationState.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StationStateRepository extends BaseRepository<StationState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(StationState, dataSource);
  }

  public async findOneOrCreate(stationState: string): Promise<StationState> {
    const record = await super._findOneOrCreate(
      { stationState },
      { stationState }
    );
    if (!record.id) await this.repository.save(record);
    return record;
  }
}
