import SystemConflict from "@api/models/systemConflict.model";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class SystemConflictRepository extends BaseRepository<SystemConflict> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(SystemConflict, dataSource);
  }

  public async updateOneOrCreate(
    systemConflict: OmitBaseEntity<SystemConflict>
  ): Promise<SystemConflict> {
    const { systemAddress, factionOneId, factionTwoId } = systemConflict;
    let record: SystemConflict | null = await this.repository.findOne({
      where: { systemAddress, factionOneId, factionTwoId }
    });

    if (!record) return this.repository.create(systemConflict);

    record.conflictStatus = systemConflict.conflictStatus;
    record.warType = systemConflict.warType;
    await this.repository.save(record);
    return record;
  }
}
