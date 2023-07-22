import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { EntityManager, Repository } from "typeorm";
import {
  Allegiance,
  ConflictFaction,
  ConflictStatus,
  ConflictWarType,
  Economy,
  Faction,
  FactionState,
  Government,
  HappinessLevel,
  PendingState,
  Power,
  PowerplayState,
  PrimarySystemFaction,
  RecoveringState,
  SecurityLevel,
  StarSystem,
  SystemConflict,
  SystemCoordinates,
  SystemEconomy,
  SystemFaction,
  ThargoidWar,
  ThargoidWarState
} from "@models/index";
import { Logger } from "winston";

@Service()
export default class FSDJumpService {
  private queryService: QueryService;
  private logger: Logger;

  constructor(@Inject() queryService: QueryService, @Inject("logger") logger: Logger) {
    this.queryService = queryService;
    this.logger = logger;
  }

  public async updateOrCreateStarSystem(jumpData: FSDJumpData): Promise<void> {
    return this.queryService.transaction(async (): Promise<void> => {
      const repo: Repository<StarSystem> = this.queryService.getRepository(StarSystem);

      let record: StarSystem | null = await repo.findOne({
        where: { systemAddress: jumpData.SystemAddress },
        relations: {
          systemPowers: true,
          systemFactions: {
            faction: true,
            factionState: true
          }
        }
      });

      if (!record) {
        const systemCoordinatesRecord: SystemCoordinates =
          await this.queryService.findOrCreateEntity(SystemCoordinates, {
            x: jumpData.StarPos[0],
            y: jumpData.StarPos[1],
            z: jumpData.StarPos[2]
          });

        record = new StarSystem(
          jumpData.SystemAddress,
          jumpData.StarSystem,
          systemCoordinatesRecord.id as number,
          new Date(jumpData.timestamp),
          jumpData.Population
        );
      } else {
        record.updatedAt = new Date(jumpData.timestamp);
      }

      await Promise.all([
        this.upsertSystemAllegiance(record, jumpData.SystemAllegiance),
        this.upsertSystemGovernment(record, jumpData.SystemGovernment),
        this.upsertSystemSecurity(record, jumpData.SystemSecurity),
        this.upsertSystemPowers(record, jumpData.Powers),
        this.upsertSystemPowerplayState(record, jumpData.PowerplayState),
        this.upsertSystemEconomies(record, jumpData.SystemEconomy, jumpData.SystemSecondEconomy),
        this.upsertPrimarySystemFaction(record, jumpData.SystemFaction)
      ]);

      await repo.save(record);

      await Promise.all([
        this.upsertSystemFactions(record, jumpData.Factions),
        this.upsertThargoidWar(record, jumpData.ThargoidWar)
      ]);

      await repo.save(record);

      await Promise.all([this.upsertSystemConflicts(record, jumpData.Conflicts)]);
    });
  }

  private async upsertSystemConflicts(
    starSystem: StarSystem,
    conflicts?: SystemConflictJump[]
  ): Promise<void> {
    if (!conflicts || conflicts.length === 0) {
      starSystem.systemConflicts = [];
      return;
    }

    const systemConflictRecords: SystemConflict[] = await Promise.all(
      conflicts.map(
        async (systemConflict: SystemConflictJump): Promise<SystemConflict> =>
          await this.updateOrCreateSystemConflict(
            starSystem.systemAddress as number,
            systemConflict
          )
      )
    );

    starSystem.systemConflicts = systemConflictRecords;
  }

  private async updateOrCreateSystemConflict(
    systemAddress: number,
    conflict: SystemConflictJump
  ): Promise<SystemConflict> {
    const factionOneRecord: ConflictFaction = await this.updateOrCreateConflictFaction(
      systemAddress,
      conflict.Faction1
    );
    const factionTwoRecord: ConflictFaction = await this.updateOrCreateConflictFaction(
      systemAddress,
      conflict.Faction2
    );
    const conflictStatusRecord: ConflictStatus = await this.queryService.findOrCreateEntity(
      ConflictStatus,
      { conflictStatus: conflict.Status }
    );
    const warTypeRecord: ConflictWarType = await this.queryService.findOrCreateEntity(
      ConflictWarType,
      { warType: conflict.WarType }
    );

    const repo: Repository<SystemConflict> = this.queryService.getRepository(SystemConflict);
    let record: SystemConflict | null = await repo.findOne({
      where: { factionOneId: factionOneRecord.id, factionTwoId: factionTwoRecord.id, systemAddress }
    });

    if (!record) {
      record = new SystemConflict(
        systemAddress,
        factionOneRecord.id as number,
        factionTwoRecord.id as number,
        conflictStatusRecord.id as number,
        warTypeRecord.id as number
      );
    } else {
      record.conflictStatusId = conflictStatusRecord.id;
      record.warTypeId = warTypeRecord.id;
    }

    await repo.save(record);
    return record;
  }

  private async updateOrCreateConflictFaction(
    systemAddress: number,
    conflictFaction: ConflictFactionJump
  ): Promise<ConflictFaction> {
    const factionRecord: Faction = await this.queryService.findOrCreateEntity(Faction, {
      factionName: conflictFaction.Name
    });

    const repo: Repository<ConflictFaction> = this.queryService.getRepository(ConflictFaction);
    let record: ConflictFaction | null = await repo.findOne({
      where: { systemAddress, factionId: factionRecord.id }
    });

    if (!record) {
      record = new ConflictFaction(
        systemAddress,
        factionRecord.id,
        conflictFaction.Stake,
        conflictFaction.WonDays
      );
    } else {
      record.wonDays = conflictFaction.WonDays;
      record.stake = conflictFaction.Stake;
    }

    await repo.save(record);
    return record;
  }

  private async upsertSystemFactions(
    starSystem: StarSystem,
    factions?: SystemFactionJump[]
  ): Promise<void> {
    if (!factions || factions.length === 0) {
      starSystem.systemFactions = [];
      return;
    }

    const systemFactionRecords: SystemFaction[] = await Promise.all(
      factions.map(
        async (systemFaction: SystemFactionJump): Promise<SystemFaction> =>
          await this.findOrCreateSystemFaction(starSystem.systemAddress as number, systemFaction)
      )
    );

    starSystem.systemFactions = systemFactionRecords;
  }

  private async upsertThargoidWar(
    starSystem: StarSystem,
    thargoidWar?: ThargoidWarJump
  ): Promise<void> {
    if (!thargoidWar) {
      starSystem.thargoidWar = undefined;
      return;
    }
    const repo: Repository<ThargoidWar> = this.queryService.getRepository(ThargoidWar);

    let record: ThargoidWar | null = await repo.findOne({
      where: { systemAddress: starSystem.systemAddress }
    });

    if (!record) {
      record = new ThargoidWar(
        starSystem.systemAddress as number,
        thargoidWar.RemainingPorts,
        thargoidWar.WarProgress,
        thargoidWar.SuccessStateReached,
        thargoidWar.EstimatedRemainingTime,
        starSystem.updatedAt
      );
    } else {
      record.updatedAt = starSystem.updatedAt;
    }

    let currentStateRecord: ThargoidWarState | undefined;
    if (thargoidWar.CurrentState)
      currentStateRecord = await this.queryService.findOrCreateEntity(ThargoidWarState, {
        warState: thargoidWar.CurrentState
      });

    let nextStateFailureRecord: ThargoidWarState | undefined;
    if (thargoidWar.NextStateFailure)
      nextStateFailureRecord = await this.queryService.findOrCreateEntity(ThargoidWarState, {
        warState: thargoidWar.NextStateFailure
      });

    let nextStateSuccessRecord: ThargoidWarState | undefined;
    if (thargoidWar.NextStateSuccess)
      nextStateSuccessRecord = await this.queryService.findOrCreateEntity(ThargoidWarState, {
        warState: thargoidWar.NextStateSuccess
      });

    record.currentStateId = currentStateRecord?.id;
    record.nextStateFailureId = nextStateFailureRecord?.id;
    record.nextStateSuccessId = nextStateSuccessRecord?.id;

    await repo.save(record);
  }

  private async upsertPrimarySystemFaction(
    starSystem: StarSystem,
    systemFaction?: PrimarySystemFactionJump
  ): Promise<void> {
    if (!systemFaction) return;

    await this.findOrCreatePrimarySystemFaction(
      starSystem.systemAddress as number,
      systemFaction.Name,
      systemFaction.FactionState
    );
  }

  private async findOrCreateSystemFaction(
    systemAddress: number,
    systemFaction: SystemFactionJump
  ): Promise<SystemFaction> {
    const repo: Repository<SystemFaction> = this.queryService.getRepository(SystemFaction);

    const {
      Name: factionName,
      FactionState: factionState,
      Happiness: happinessLevel,
      Government: government,
      Allegiance: allegiance,
      ActiveStates: activeStates,
      PendingStates: pendingStates,
      RecoveringStates: recoveringStates,
      Influence: influence
    } = systemFaction;

    const factionRecord: Faction = await this.queryService.findOrCreateEntity(Faction, {
      factionName
    });
    const happinessLevelRecord: HappinessLevel = await this.queryService.findOrCreateEntity(
      HappinessLevel,
      { happinessLevel }
    );
    const governmentRecord: Government = await this.queryService.findOrCreateEntity(Government, {
      government: `$government_${government};`
    });
    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(Allegiance, {
      allegiance
    });
    const factionStateRecord: FactionState | undefined = !factionState
      ? undefined
      : await this.queryService.findOrCreateEntity(FactionState, { factionState });

    let record: SystemFaction | null = await repo.findOne({
      where: {
        systemAddress,
        factionId: factionRecord.id
      },
      relations: {
        activeStates: true,
        pendingStates: true,
        recoveringStates: true
      }
    });

    if (!record) {
      record = new SystemFaction(
        systemAddress,
        factionRecord.id,
        allegianceRecord.id as number,
        happinessLevelRecord.id as number,
        governmentRecord.id,
        influence,
        factionStateRecord?.id
      );
    }
    await Promise.all([
      this.upsertActiveStates(record, activeStates),
      this.upsertPendingStates(record, pendingStates),
      this.upsertRecoveringStates(record, recoveringStates)
    ]);
    await repo.save(record);

    return record;
  }

  private async upsertRecoveringStates(
    systemFaction: SystemFaction,
    recoveringStates?: TrendingStateJump[]
  ): Promise<void> {
    if (!recoveringStates || recoveringStates.length === 0) {
      systemFaction.recoveringStates = [];
      return;
    }

    const recoveringStateRecords: RecoveringState[] = await Promise.all(
      recoveringStates.map(
        async (recoveringState: TrendingStateJump): Promise<RecoveringState> =>
          await this.findOrCreateRecoveringState(recoveringState.State, recoveringState.Trend)
      )
    );

    systemFaction.recoveringStates = recoveringStateRecords;
  }

  private async upsertPendingStates(
    systemFaction: SystemFaction,
    pendingStates?: TrendingStateJump[]
  ): Promise<void> {
    if (!pendingStates || pendingStates.length === 0) {
      systemFaction.pendingStates = [];
      return;
    }

    const pendingStateRecords: PendingState[] = await Promise.all(
      pendingStates.map(
        async (pendingState: TrendingStateJump): Promise<PendingState> =>
          await this.findOrCreatePendingState(pendingState.State, pendingState.Trend)
      )
    );

    systemFaction.pendingStates = pendingStateRecords;
  }

  private async findOrCreateRecoveringState(
    factionState: string,
    trend: number
  ): Promise<PendingState> {
    const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
      FactionState,
      { factionState }
    );
    return await this.queryService.findOrCreateEntity(RecoveringState, {
      factionStateId: factionStateRecord.id,
      trend
    });
  }

  private async findOrCreatePendingState(
    factionState: string,
    trend: number
  ): Promise<PendingState> {
    const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
      FactionState,
      { factionState }
    );
    return await this.queryService.findOrCreateEntity(PendingState, {
      factionStateId: factionStateRecord.id,
      trend
    });
  }

  private async upsertActiveStates(
    systemFaction: SystemFaction,
    activeStates?: ActiveStateJump[]
  ): Promise<void> {
    if (!activeStates || activeStates.length === 0) {
      systemFaction.activeStates = [];
      return;
    }

    const activeStateRecords: FactionState[] = await Promise.all(
      activeStates.map(
        async (activeState: ActiveStateJump): Promise<FactionState> =>
          await this.queryService.findOrCreateEntity(FactionState, {
            factionState: activeState.State
          })
      )
    );

    systemFaction.activeStates = activeStateRecords;
  }

  private async findOrCreatePrimarySystemFaction(
    systemAddress: number,
    factionName: string,
    factionState?: string
  ): Promise<PrimarySystemFaction> {
    const factionRecord: Faction = await this.queryService.findOrCreateEntity(Faction, {
      factionName
    });
    let factionStateRecord: FactionState | undefined;
    if (factionState)
      factionStateRecord = await this.queryService.findOrCreateEntity(FactionState, {
        factionState
      });

    const repo: Repository<PrimarySystemFaction> =
      this.queryService.getRepository(PrimarySystemFaction);

    let record: PrimarySystemFaction | null = await repo.findOne({ where: { systemAddress } });

    if (!record) {
      record = new PrimarySystemFaction(systemAddress, factionRecord.id, factionStateRecord?.id);
    }

    await repo.save(record);

    return record;
  }

  private async upsertSystemEconomies(
    starSystem: StarSystem,
    primaryEconomy?: string,
    secondaryEconomy?: string
  ): Promise<void> {
    if (!primaryEconomy) return;

    const primaryEconomyRecord: Economy = await this.queryService.findOrCreateEntity(Economy, {
      economyName: primaryEconomy
    });
    let secondaryEconomyRecord: Economy | undefined;
    if (secondaryEconomy)
      secondaryEconomyRecord = await this.queryService.findOrCreateEntity(Economy, {
        economyName: secondaryEconomy
      });

    const systemEconomyRecord: SystemEconomy = await this.queryService.findOrCreateEntity(
      SystemEconomy,
      { primaryEconomyId: primaryEconomyRecord.id, secondaryEconomyId: secondaryEconomyRecord?.id }
    );

    starSystem.systemEconomyId = systemEconomyRecord.id;
  }

  private async upsertSystemPowerplayState(
    starSystem: StarSystem,
    powerplayState?: string
  ): Promise<void> {
    if (!powerplayState) return;

    const powerplayStateRecord: PowerplayState = await this.queryService.findOrCreateEntity(
      PowerplayState,
      { powerplayState }
    );

    starSystem.powerplayStateId = powerplayStateRecord.id;
  }

  private async upsertSystemPowers(starSystem: StarSystem, systemPowers?: string[]): Promise<void> {
    if (!systemPowers || systemPowers.length === 0) return;

    const powerRecords: Power[] = await Promise.all(
      systemPowers.map(
        (powerName: string): Promise<Power> =>
          this.queryService.findOrCreateEntity(Power, { powerName })
      )
    );
    starSystem.systemPowers = [
      ...(starSystem.systemPowers || []),
      ...powerRecords.filter(
        (power: Power): boolean =>
          !starSystem.systemPowers?.some(
            (systemPower: Power): boolean => systemPower.id === power.id
          )
      )
    ];
  }

  private async upsertSystemSecurity(
    starSystem: StarSystem,
    securityLevel?: string
  ): Promise<void> {
    if (!securityLevel) return;

    const securityLevelRecord: SecurityLevel = await this.queryService.findOrCreateEntity(
      SecurityLevel,
      { securityLevel }
    );
    starSystem.securityLevelId = securityLevelRecord.id;
  }

  private async upsertSystemAllegiance(starSystem: StarSystem, allegiance?: string): Promise<void> {
    if (!allegiance) return;
    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(Allegiance, {
      allegiance
    });
    starSystem.allegianceId = allegianceRecord.id;
  }

  private async upsertSystemGovernment(starSystem: StarSystem, government?: string): Promise<void> {
    if (!government) return;

    const governmentRecord: Government = await this.queryService.findOrCreateEntity(Government, {
      government
    });
    starSystem.governmentId = governmentRecord.id;
  }
}
