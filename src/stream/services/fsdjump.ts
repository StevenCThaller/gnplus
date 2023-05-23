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
} from "@api/models";
import ActiveState from "@api/models/activeState.model";
import {
  AllegianceRepository,
  ConflictFactionRepository,
  ConflictStatusRepository,
  ConflictWarTypeRepository,
  EconomyRepository,
  FactionRepository,
  FactionStateRepository,
  GovernmentRepository,
  HappinessLevelRepository,
  PendingStateRepository,
  PowerRepository,
  PowerplayStateRepository,
  PrimarySystemFactionRepository,
  RecoveringStateRepository,
  SecurityLevelRepository,
  StarSystemRepository,
  SystemConflictRepository,
  SystemCoordinatesRepository,
  SystemEconomyRepository,
  SystemFactionRepository,
  ThargoidWarRepository,
  ThargoidWarStateRepository
} from "@api/repositories";
import ActiveStateRepository from "@api/repositories/activeState";
import PoliticalHandler from "@stream/base/politicalHandler";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Inject, Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class FSDJumpHandler extends PoliticalHandler<FSDJumpData> {
  /**
   *
   * @param {DataSource} dataSource - Entity repository injected on Container call
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource
  ) {
    super(dataSource);
  }

  public async handleEvent(data: FSDJumpData): Promise<void> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      this.manager = manager;

      await this.findOrCreateSystem(data);
    });
  }

  public async findOrCreateActiveState(
    systemFactionId: number,
    activeState: string
  ): Promise<ActiveState> {
    const repo: ActiveStateRepository = this.getRepo(ActiveStateRepository);
    const factionState: FactionState = (await this.findOrCreateFactionState(
      activeState
    )) as FactionState;
    const record: ActiveState = await repo.findOneOrCreate(
      systemFactionId,
      factionState.id as number
    );
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateActiveStateArray(
    systemFactionId: number,
    data: ActiveStateJump[]
  ): Promise<ActiveState[] | undefined> {
    if (!data) return;
    const output: ActiveState[] = [];

    for (const activeState of data) {
      const record: ActiveState = (await this.findOrCreateActiveState(
        systemFactionId,
        activeState.State
      )) as ActiveState;
      output.push(record);
    }
    return output;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreateConflictFaction(
    systemAddress: number,
    data: ConflictFactionJump
  ): Promise<ConflictFaction> {
    const repo: ConflictFactionRepository = this.getRepo(
      ConflictFactionRepository
    );
    const record: ConflictFaction = await repo.updateOneOrCreate({
      systemAddress,
      factionId: ((await this.findOrCreateFaction(data.Name)) as Faction).id,
      stake: data.Stake,
      wonDays: data.WonDays
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param conflictStatus
   * @returns
   */
  public async findOrCreateConflictStatus(
    conflictStatus: string
  ): Promise<ConflictStatus> {
    const repo: ConflictStatusRepository = this.getRepo(
      ConflictStatusRepository
    );
    const record: ConflictStatus = await repo.findOneOrCreate(conflictStatus);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param warType
   * @returns
   */
  public async findOrCreateConflictWarType(
    warType: string
  ): Promise<ConflictWarType> {
    const repo: ConflictWarTypeRepository = this.getRepo(
      ConflictWarTypeRepository
    );
    const record: ConflictWarType = await repo.findOneOrCreate(warType);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param happinessLevel
   * @returns
   */
  public async findOrCreateHappinessLevel(
    happinessLevel: string
  ): Promise<HappinessLevel> {
    const repo: HappinessLevelRepository = this.getRepo(
      HappinessLevelRepository
    );
    const record: HappinessLevel = await repo.findOneOrCreate(happinessLevel);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreatePendingState(
    systemFactionId: number,
    data: TrendingStateJump
  ): Promise<PendingState> {
    const repo: PendingStateRepository = this.getRepo(PendingStateRepository);
    const factionStateRecord = (await this.findOrCreateFactionState(
      data.State
    )) as FactionState;
    const record: PendingState = await repo.findOrCreate({
      systemFactionId,
      factionStateId: factionStateRecord.id,
      trend: data.Trend
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreatePendingStateArray(
    systemFactionId: number,
    data: TrendingStateJump[]
  ): Promise<PendingState[] | undefined> {
    if (!data) return;
    const output: PendingState[] = [];

    for (const pendingState of data) {
      const record: PendingState = await this.findOrCreatePendingState(
        systemFactionId,
        pendingState
      );
      output.push(record);
    }
    return output;
  }

  /**
   *
   * @param power
   * @returns
   */
  public async findOrCreatePower(power: string): Promise<Power> {
    const repo: PowerRepository = this.getRepo(PowerRepository);
    const record: Power = await repo.findOneOrCreate(power);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreatePowerArray(
    data?: string[]
  ): Promise<Power[] | undefined> {
    if (!data) return;
    const output: Power[] = [];

    for (const power of data) {
      const record: Power = await this.findOrCreatePower(power);
      output.push(record);
    }
    return output;
  }

  /**
   *
   * @param powerplayState
   * @returns
   */
  public async findOrCreatePowerplayState(
    powerplayState?: string
  ): Promise<PowerplayState | undefined> {
    if (!powerplayState) return;
    const repo: PowerplayStateRepository = this.getRepo(
      PowerplayStateRepository
    );
    const record: PowerplayState = await repo.findOneOrCreate(powerplayState);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreatePrimarySystemFaction(
    systemAddress: number,
    data: PrimarySystemFactionJump
  ): Promise<PrimarySystemFaction | undefined> {
    if (!data || !data.Name) return;
    const repo: PrimarySystemFactionRepository = this.getRepo(
      PrimarySystemFactionRepository
    );
    const record: PrimarySystemFaction = await repo.findOrCreate({
      systemAddress: systemAddress,
      faction: (await this.findOrCreateFaction(data.Name)) as Faction,
      factionState: await this.findOrCreateFactionState(data.FactionState)
    } as PrimarySystemFaction);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateRecoveringState(
    systemFactionId: number,
    data: TrendingStateJump
  ): Promise<RecoveringState> {
    const repo: RecoveringStateRepository = this.getRepo(
      RecoveringStateRepository
    );
    const factionStateRecord: FactionState =
      (await this.findOrCreateFactionState(data.State)) as FactionState;
    const record: RecoveringState = await repo.findOrCreate({
      systemFactionId,
      factionStateId: factionStateRecord.id,
      trend: data.Trend
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateRecoveringStatesArray(
    systemFactionId: number,
    data: TrendingStateJump[]
  ): Promise<RecoveringState[] | undefined> {
    if (!data) return;
    const output: RecoveringState[] = [];

    for (const recoveringState of data) {
      const record: RecoveringState = await this.findOrCreateRecoveringState(
        systemFactionId,
        recoveringState
      );
      output.push(record);
    }
    return output;
  }

  /**
   *
   * @param securityLevel
   * @returns
   */
  public async findOrCreateSecurityLevel(
    securityLevel: string
  ): Promise<SecurityLevel | undefined> {
    if (!securityLevel) return;
    const repo: SecurityLevelRepository = this.getRepo(SecurityLevelRepository);
    const record: SecurityLevel = await repo.findOneOrCreate(securityLevel);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateSystem(data: FSDJumpData): Promise<StarSystem> {
    const repo: StarSystemRepository = this.getRepo(StarSystemRepository);

    const government = await this.findOrCreateGovernment(data.SystemGovernment);
    const allegiance = await this.findOrCreateAllegiance(data.SystemAllegiance);
    const systemEconomy = await this.findOrCreateSystemEconomy(data);
    const securityLevel = await this.findOrCreateSecurityLevel(
      data.SystemSecurity
    );
    const primaryFaction = await this.findOrCreatePrimarySystemFaction(
      data.SystemAddress,
      data.SystemFaction
    );
    const powerplayState = await this.findOrCreatePowerplayState(
      data.PowerplayState
    );
    const thargoidWar = await this.findOrCreateThargoidWar(
      data.SystemAddress,
      data.ThargoidWar
    );
    const systemCoordinates = await this.findOrCreateSystemCoordinates(
      data.StarPos
    );

    const record: StarSystem = await repo.updateOneOrCreate({
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      population: data.Population,
      systemCoordinates,
      government,
      allegiance,
      systemEconomy,
      primaryFaction,
      securityLevel,
      powerplayState,
      thargoidWar
    });
    await repo.save(record);

    record.systemFactions = await this.findOrCreateSystemFactionArray(
      data.SystemAddress,
      data.Factions
    );
    record.systemPowers = await this.findOrCreatePowerArray(data.Powers);
    record.systemConflicts = await this.findOrCreateSystemConflictArray(
      data.SystemAddress,
      data.Conflicts
    );

    await repo.save(record);
    return record;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreateSystemConflict(
    systemAddress: number,
    data: SystemConflictJump
  ): Promise<SystemConflict> {
    const repo: SystemConflictRepository = this.getRepo(
      SystemConflictRepository
    );
    const record: SystemConflict = await repo.updateOneOrCreate({
      systemAddress,
      factionOneId: (
        (await this.findOrCreateConflictFaction(
          systemAddress,
          data.Faction1
        )) as ConflictFaction
      ).id,
      factionTwoId: (
        (await this.findOrCreateConflictFaction(
          systemAddress,
          data.Faction2
        )) as ConflictFaction
      ).id,
      conflictStatus: await this.findOrCreateConflictStatus(data.Status),
      warType: await this.findOrCreateConflictWarType(data.WarType)
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreateSystemConflictArray(
    systemAddress: number,
    data?: SystemConflictJump[]
  ): Promise<SystemConflict[] | undefined> {
    if (!data) return;
    const output: SystemConflict[] = [];
    for (const systemConflict of data) {
      const record: SystemConflict = await this.findOrCreateSystemConflict(
        systemAddress,
        systemConflict
      );
      output.push(record);
    }

    return output;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateSystemEconomy(
    data: FSDJumpData
  ): Promise<SystemEconomy | undefined> {
    if (
      !hasOwnProperty(data, "SystemEconomy") &&
      !hasOwnProperty(data, "SystemSecondEconomy")
    )
      return;
    const repo: SystemEconomyRepository = this.getRepo(SystemEconomyRepository);
    const record: SystemEconomy = await repo.findOneOrCreate({
      primaryEconomy: await this.findOrCreateEconomy(data.SystemEconomy),
      secondaryEconomy: await this.findOrCreateEconomy(data.SystemSecondEconomy)
    } as SystemEconomy);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateSystemFactionArray(
    systemAddress: number,
    data?: SystemFactionJump[]
  ): Promise<SystemFaction[] | undefined> {
    if (!data) return;
    const output: SystemFaction[] = [];

    for (const systemFaction of data) {
      const record: SystemFaction = (await this.findOrCreateSystemFaction(
        systemAddress,
        systemFaction
      )) as SystemFaction;
      output.push(record);
    }
    return output;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreateSystemFaction(
    systemAddress: number,
    data: SystemFactionJump
  ): Promise<SystemFaction | undefined> {
    if (!data) return;
    const repo: SystemFactionRepository = this.getRepo(SystemFactionRepository);
    const allegiance = await this.findOrCreateAllegiance(data.Allegiance);
    const government = await this.findOrCreateGovernment(data.Government);
    const happinessLevel = await this.findOrCreateHappinessLevel(
      data.Happiness
    );
    const faction = await this.findOrCreateFaction(data.Name);
    const factionState = data.FactionState
      ? await this.findOrCreateFactionState(data.FactionState)
      : undefined;

    const record: SystemFaction = await repo.findOrCreate({
      systemAddress: systemAddress,
      allegiance,
      government,
      happinessLevel,
      faction,
      factionState
    });
    if (data.ActiveStates) {
      await this.findOrCreateActiveStateArray(
        record.id as number,
        data.ActiveStates
      );
    }

    if (!record.hasId()) await repo.save(record);

    if (data.PendingStates) {
      await this.findOrCreatePendingStateArray(
        record.id as number,
        data.PendingStates
      );
    }
    if (data.RecoveringStates) {
      await this.findOrCreateRecoveringStatesArray(
        record.id as number,
        data.RecoveringStates
      );
    }

    return record;
  }

  /**
   *
   * @param systemAddress
   * @param data
   * @returns
   */
  public async findOrCreateThargoidWar(
    systemAddress: number,
    data?: ThargoidWarJump
  ): Promise<ThargoidWar | undefined> {
    if (!data) return;
    const repo: ThargoidWarRepository = this.getRepo(ThargoidWarRepository);
    const record: ThargoidWar = await repo.updateOrCreate({
      systemAddress,
      remainingPorts: data.RemainingPorts,
      warProgress: data.WarProgress,
      estimatedRemainingTime: data.EstimatedRemainingTime,
      successStateReached: data.SuccessStateReached,
      currentState: await this.findOrCreateThargoidWarState(data.CurrentState),
      nextStateFailure: await this.findOrCreateThargoidWarState(
        data.NextStateFailure
      ),
      nextStateSuccess: await this.findOrCreateThargoidWarState(
        data.NextStateSuccess
      )
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param warState
   * @returns
   */
  public async findOrCreateThargoidWarState(
    warState: string
  ): Promise<ThargoidWarState> {
    const repo: ThargoidWarStateRepository = this.getRepo(
      ThargoidWarStateRepository
    );
    const record: ThargoidWarState = await repo.findOneOrCreate(warState);
    if (!record.hasId()) await repo.save(record);
    return record;
  }
}
