import Allegiance from "@api/models/allegiance.model";
import { Service, Inject } from "typedi";
import BaseService from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import ConflictFaction from "@api/models/conflictFaction.model";

@Service()
export default class ConflictFactionRepository extends BaseService<ConflictFaction> {
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

    record = { ...record, ...conflictFaction } as ConflictFaction;

    await this.repository.save(record);
    return record;
  }
}
