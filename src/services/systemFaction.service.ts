import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import {
  Allegiance,
  Faction,
  FactionState,
  Government,
  HappinessLevel,
  PendingState,
  RecoveringState,
  StarSystem,
  SystemFaction
} from "@models/index";
import { DataSource, DeleteResult, EntityManager } from "typeorm";

@Service()
export default class SystemFactionService extends DatabaseService<SystemFaction> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, SystemFaction);
  }

  public async deleteMultipleByIds(idList: number[]): Promise<DeleteResult[]> {
    return Promise.all(idList.map((id: number): Promise<DeleteResult> => this.deleteById(id)));
  }

  public async deleteById(id: number): Promise<DeleteResult> {
    return this.deleteEntity(SystemFaction, { id });
  }

  public async clearInactiveSystemFactions(
    starSystem: StarSystem,
    activeSystemFactions: SystemFaction[]
  ): Promise<void> {
    if (!starSystem.systemFactions) return;
    const inactives: SystemFaction[] = this.getInactiveSystemFactions(
      starSystem.systemFactions,
      activeSystemFactions
    );
    await this.repository.remove(inactives);
  }

  private getInactiveSystemFactions(
    previousFactions: SystemFaction[],
    currentFactions: SystemFaction[]
  ): SystemFaction[] {
    return previousFactions.filter(
      (faction: SystemFaction): boolean =>
        !currentFactions.some(
          (currFaction: SystemFaction): boolean => currFaction.id === faction.id
        )
    );
  }

  public async findOrCreate(
    systemFaction: SystemFactionParams | SystemFactionParams[]
  ): Promise<SystemFaction | SystemFaction[]> {
    try {
      if (Array.isArray(systemFaction)) {
        return await Promise.all(
          systemFaction.map(
            (faction: SystemFactionParams): Promise<SystemFaction> =>
              this.findOrCreate(faction as SystemFactionParams) as Promise<SystemFaction>
          )
        );
      }

      const faction = await this.findOrCreateEntity(Faction, {
        factionName: systemFaction.faction
      });
      const { systemAddress, influence } = systemFaction;
      let record: SystemFaction | null = await this.repository.findOne({
        where: {
          systemAddress: systemFaction.systemAddress,
          factionId: faction.id
        }
      });

      if (!record) {
        record = this.repository.create({ systemAddress, faction, influence });
      }

      await Promise.all([
        this.upsertAllegiance(record, systemFaction.allegiance),
        this.upsertGovernment(record, systemFaction.government),
        this.upsertFactionState(record, systemFaction.factionState),
        this.upsertHappinessLevel(record, systemFaction.happinessLevel),
        this.upsertActiveStates(record, systemFaction.activeStates),
        this.upsertPendingStates(record, systemFaction.pendingStates),
        this.upsertRecoveringStates(record, systemFaction.recoveringStates)
      ]);

      await this.repository.save(record);

      return record;
    } catch (error) {
      this.logger.error("Error thrown while running SystemFactionService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertActiveStates(
    systemFaction: SystemFaction,
    activeStates?: string[]
  ): Promise<void> {
    if (activeStates && activeStates.length) {
      if (systemFaction.hasId())
        await this.repository
          .createQueryBuilder()
          .delete()
          .from("faction_has_active_states")
          .where(`system_faction_id = :thisId`, { thisId: systemFaction.id })
          .execute();

      systemFaction.activeStates = await Promise.all(
        activeStates.map(
          (factionState: string): Promise<FactionState> =>
            this.findOrCreateEntity(FactionState, { factionState })
        )
      );
    }
  }
  private async upsertPendingStates(
    systemFaction: SystemFaction,
    pendingStates?: TrendingStateParams[]
  ): Promise<void> {
    if (pendingStates && pendingStates.length) {
      if (systemFaction.hasId())
        await this.repository
          .createQueryBuilder()
          .delete()
          .from("faction_has_pending_states")
          .where(`system_faction_id = :thisId`, { thisId: systemFaction.id })
          .execute();

      const setOfPendingStates = new Set();
      pendingStates.forEach((pendingState: TrendingStateParams): void => {
        setOfPendingStates.add(pendingState.factionState);
      });

      const recordTable: { [key: string]: FactionState } = {};
      systemFaction.pendingStates = [];

      for (const pendingState of pendingStates) {
        const factionState: string = pendingState.factionState as string;
        if (!recordTable[factionState])
          recordTable[factionState] = await this.findOrCreateEntity(FactionState, { factionState });

        const pendingStateRecord = await this.findOrCreateEntity(PendingState, {
          factionStateId: recordTable[factionState].id,
          trend: pendingState.trend
        });
        systemFaction.pendingStates = [...systemFaction.pendingStates, pendingStateRecord];
      }
    }
  }

  private async upsertRecoveringStates(
    systemFaction: SystemFaction,
    recoveringStates?: TrendingStateParams[]
  ): Promise<void> {
    if (recoveringStates && recoveringStates.length) {
      if (systemFaction.hasId())
        await this.repository
          .createQueryBuilder()
          .delete()
          .from("faction_has_recovering_states")
          .where(`system_faction_id = :thisId`, { thisId: systemFaction.id })
          .execute();

      const setOfRecoveringStates = new Set();
      recoveringStates.forEach((recoveringState: TrendingStateParams): void => {
        setOfRecoveringStates.add(recoveringState.factionState);
      });

      const recordTable: { [key: string]: FactionState } = {};
      systemFaction.recoveringStates = [];

      for (const recoveringState of recoveringStates) {
        const factionState: string = recoveringState.factionState as string;
        if (!recordTable[factionState])
          recordTable[factionState] = await this.findOrCreateEntity(FactionState, { factionState });

        const recoveringStateRecord = await this.findOrCreateEntity(RecoveringState, {
          factionStateId: recordTable[factionState].id,
          trend: recoveringState.trend
        });
        systemFaction.recoveringStates = [...systemFaction.recoveringStates, recoveringStateRecord];
      }
    }
  }

  private async upsertHappinessLevel(
    systemFaction: SystemFaction,
    happinessLevel?: string
  ): Promise<void> {
    if (happinessLevel) {
      systemFaction.happinessLevel = await this.findOrCreateEntity(HappinessLevel, {
        happinessLevel
      });
    }
  }

  private async upsertFactionState(
    systemFaction: SystemFaction,
    factionState?: string
  ): Promise<void> {
    if (factionState) {
      systemFaction.factionState = await this.findOrCreateEntity(FactionState, { factionState });
    }
  }

  private async upsertAllegiance(systemFaction: SystemFaction, allegiance?: string): Promise<void> {
    if (allegiance) {
      // systemFaction.allegiance = await this.findOrCreateEntity(Allegiance, { allegiance });
    }
  }

  private async upsertGovernment(systemFaction: SystemFaction, government?: string): Promise<void> {
    if (government) {
      // systemFaction.government = await this.findOrCreateEntity(Government, { government });
    }
  }

  public override setDataSource(source: DataSource | EntityManager): SystemFactionService {
    super.setDataSource(source);
    return this;
  }
}
