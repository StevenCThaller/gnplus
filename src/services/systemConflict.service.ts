import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import {
  ConflictFaction,
  ConflictStatus,
  ConflictWarType,
  Faction,
  SystemConflict
} from "@models/index";

@Service()
export default class SystemConflictService extends DatabaseService<SystemConflict> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, SystemConflict);
    this.repository = this.dataSource.getRepository(SystemConflict);
  }

  public async findOrCreate(
    systemConflict: SystemConflictParams | SystemConflictParams[]
  ): Promise<SystemConflict | SystemConflict[]> {
    try {
      if (Array.isArray(systemConflict)) {
        return await Promise.all(
          systemConflict.map(
            (conflict: SystemConflictParams): Promise<SystemConflict> =>
              this.findOrCreate(conflict as SystemConflictParams) as Promise<SystemConflict>
          )
        );
      }

      const { systemAddress } = systemConflict;

      const factionOne: ConflictFaction = await this.findOrCreateConflictFaction(
        systemAddress,
        systemConflict.factionOne
      );
      const factionTwo: ConflictFaction = await this.findOrCreateConflictFaction(
        systemAddress,
        systemConflict.factionTwo
      );

      let record: SystemConflict | null = await this.repository.findOne({
        where: {
          systemAddress,
          factionOneId: factionOne.id,
          factionTwoId: factionTwo.id
        }
      });

      if (!record) {
        record = this.repository.create({
          systemAddress,
          factionOne,
          factionTwo,
          createdAt: systemConflict.createdAt,
          updatedAt: systemConflict.updatedAt
        });
      } else {
        record.updatedAt = systemConflict.updatedAt;
      }

      await Promise.all([
        this.upsertConflictStatus(record, systemConflict.conflictStatus),
        this.upsertWarType(record, systemConflict.warType)
      ]);

      await this.repository.save(record);

      return record;
    } catch (error) {
      this.logger.error("Error thrown while running SystemConflictService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async findOrCreateConflictFaction(
    systemAddress: number,
    params: ConflictFactionParams
  ): Promise<ConflictFaction> {
    const faction: Faction = await this.findOrCreateEntity(Faction, {
      factionName: params.faction
    });

    let conflictFaction: ConflictFaction | null = await this.dataSource
      .getRepository(ConflictFaction)
      .findOne({ where: { factionId: faction.id, systemAddress } });
    const conflictFactionRepo = this.dataSource.getRepository(ConflictFaction);
    if (!conflictFaction) {
      conflictFaction = conflictFactionRepo.create({ ...params, faction, systemAddress });
    }

    await conflictFactionRepo.save(conflictFaction);
    return conflictFaction;
  }

  private async upsertConflictStatus(
    systemConflict: SystemConflict,
    conflictStatus?: string
  ): Promise<void> {
    if (conflictStatus) {
      systemConflict.conflictStatus = await this.findOrCreateEntity(ConflictStatus, {
        conflictStatus
      });
    }
  }

  private async upsertWarType(systemConflict: SystemConflict, warType?: string): Promise<void> {
    if (warType) {
      systemConflict.warType = await this.findOrCreateEntity(ConflictWarType, { warType });
    }
  }
}
