import Power from "@api/models/power.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class PowerRepository extends BaseRepository<Power> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Power, dataSource);
  }

  public async findOneOrCreate(powerName: string): Promise<Power> {
    return super._findOneOrCreate({ powerName }, { powerName });
  }

  public async bulkFindOrCreate(powers: string[]): Promise<Power[]> {
    const powerRecords: Power[] = [];

    for (const powerName of powers) {
      const powerRecord = await this.findOneOrCreate(powerName);
      powerRecords.push(powerRecord);
    }

    return powerRecords;
  }
}
