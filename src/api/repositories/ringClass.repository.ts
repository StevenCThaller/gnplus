import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { RingClass } from "@api/models";

@Service()
export default class RingClassRepository extends BaseRepository<RingClass> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(RingClass, dataSource);
  }

  public async findOneOrCreate(className: string): Promise<RingClass> {
    return super._findOneOrCreate({ className }, { className });
  }
}
