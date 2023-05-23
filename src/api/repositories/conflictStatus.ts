import ConflictStatus from "@api/models/conflictStatus.model";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class ConflictStatusRepository extends BaseService<ConflictStatus> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(ConflictStatus, dataSource);
  }

  public async findOneOrCreate(
    conflictStatus: string
  ): Promise<ConflictStatus> {
    const result = await super._findOneOrCreate(
      { conflictStatus },
      { conflictStatus }
    );
    if (!result.id) await this.repository.save(result);
    return result;
  }
}
