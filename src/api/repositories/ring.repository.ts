import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { Ring } from "@api/models";

@Service()
export default class RingRepository extends BaseRepository<Ring> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Ring, dataSource);
  }

  public async findOneOrCreate(ring: OmitBaseEntity<Ring>): Promise<Ring> {
    const { ringName } = ring;
    return super._findOneOrCreate({ ringName }, ring);
  }
}
