import { ConflictWarType } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class ConflictWarTypeRepository extends BaseRepository<ConflictWarType> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(ConflictWarType, dataSource);
  }

  public async findOneOrCreate(warType: string): Promise<ConflictWarType> {
    const result = await super._findOneOrCreate({ warType }, { warType });
    if (!result.id) await this.repository.save(result);
    return result;
  }
}
