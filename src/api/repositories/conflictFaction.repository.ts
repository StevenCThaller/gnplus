import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import { ConflictFaction } from "@api/models";

@Service()
export default class ConflictFactionRepository extends BaseRepository<ConflictFaction> {
  /**
   *
   */
  constructor(protected dataSource: DataSource | EntityManager) {
    super(ConflictFaction, dataSource);
  }

  public async updateOneOrCreate(
    conflictFaction: OmitBaseEntity<ConflictFaction>
  ): Promise<ConflictFaction> {
    const { systemAddress, factionId } = conflictFaction;
    let record: ConflictFaction | null = await this.repository.findOne({
      where: { systemAddress, factionId }
    });

    if (!record) return this.repository.create(conflictFaction);

    record.stake = conflictFaction.stake;
    record.wonDays = conflictFaction.wonDays;

    await this.repository.save(record);
    return record;
  }
}
