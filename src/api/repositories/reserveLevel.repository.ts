import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { ReserveLevel } from "@api/models";

@Service()
export default class ReserveLevelRepository extends BaseRepository<ReserveLevel> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(ReserveLevel, dataSource);
  }

  public async findOneOrCreate(reserveLevel: string): Promise<ReserveLevel> {
    return super._findOneOrCreate({ reserveLevel }, { reserveLevel });
  }
}
