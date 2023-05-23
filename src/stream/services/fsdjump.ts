import ConflictFaction from "@api/models/conflictFaction.model";
import ConflictStatus from "@api/models/conflictStatus.model";
import ConflictWarType from "@api/models/conflictWarType.model";
import Faction from "@api/models/faction.model";
import FactionState from "@api/models/factionState.model";
import HappinessLevel from "@api/models/happiness.model";
import PendingState from "@api/models/pendingState.model";
import Power from "@api/models/power.model";
import PowerplayState from "@api/models/powerplayState.model";
import PrimarySystemFaction from "@api/models/primarySystemFaction.model";
import RecoveringState from "@api/models/recoveringState.model";
import SecurityLevel from "@api/models/securityLevel.model";
import StarSystem from "@api/models/starSystem.model";
import SystemConflict from "@api/models/systemConflict.model";
import SystemEconomy from "@api/models/systemEconomy.model";
import SystemFaction from "@api/models/systemFaction.model";
import ThargoidWar from "@api/models/thargoidWar.model";
import ThargoidWarState from "@api/models/thargoidWarState.model";
import ConflictFactionRepository from "@api/repositories/conflictFaction";
import ConflictStatusRepository from "@api/repositories/conflictStatus";
import ConflictWarTypeRepository from "@api/repositories/conflictWarType";
import HappinessRepository from "@api/repositories/happiness";
import PendingStateRepository from "@api/repositories/pendingState";
import PowerRepository from "@api/repositories/power";
import PowerplayStateRepository from "@api/repositories/powerplayState";
import PrimarySystemFactionRepository from "@api/repositories/primarySystemFaction";
import RecoveringStateRepository from "@api/repositories/recoveringState";
import SecurityLevelRepository from "@api/repositories/securityLevel";
import StarSystemRepository from "@api/repositories/starSystem";
import SystemConflictRepository from "@api/repositories/systemConflict";
import SystemEconomyRepository from "@api/repositories/systemEconomy";
import SystemFactionRepository from "@api/repositories/systemFaction";
import ThargoidWarRepository from "@api/repositories/thargoidWar";
import ThargoidWarStateRepository from "@api/repositories/thargoidWarState";
import PoliticalHandler from "@stream/base/politicalHandler";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Inject, Service } from "typedi";
import { DataSource } from "typeorm";

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

  /**
   *
   * @param data
   */
  public override async processEventData(data: FSDJumpData): Promise<void> {
    await this.findOrCreateSystem(data);
  }

  /**
   *
   * @param data
   * @returns
   */
  public async findOrCreateActiveStateArray(
    data: ActiveStateJump[]
  ): Promise<FactionState[] | undefined> {
    if (!data) return;
    return await Promise.all(
      data.map(
        async (activeState: ActiveStateJump): Promise<FactionState> =>
          (await this.findOrCreateFactionState(
            activeState.State
          )) as FactionState
      )
    );
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
  public async findOrCreateHappiness(
    happinessLevel: string
  ): Promise<HappinessLevel | undefined> {
    if (!happinessLevel) return;
    const repo: HappinessRepository = this.getRepo(HappinessRepository);
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
    data: TrendingStateJump
  ): Promise<PendingState> {
    const repo: PendingStateRepository = this.getRepo(PendingStateRepository);
    const record: PendingState = await repo.findOrCreate({
      factionStateId: (
        (await this.findOrCreateFactionState(data.State)) as FactionState
      ).id,
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
    data: TrendingStateJump[]
  ): Promise<PendingState[] | undefined> {
    if (!data) return;
    return Promise.all(
      data.map(
        async (pendingState: TrendingStateJump): Promise<PendingState> =>
          await this.findOrCreatePendingState(pendingState)
      )
    );
  }

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
    return Promise.all(
      data.map(
        async (power: string): Promise<Power> =>
          await this.findOrCreatePower(power)
      )
    );
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
    data: TrendingStateJump
  ): Promise<RecoveringState> {
    const repo: RecoveringStateRepository = this.getRepo(
      RecoveringStateRepository
    );
    const record: RecoveringState = await repo.findOrCreate({
      factionState: (await this.findOrCreateFactionState(
        data.State
      )) as FactionState,
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
    data: TrendingStateJump[]
  ): Promise<RecoveringState[] | undefined> {
    if (!data) return;
    return await Promise.all(
      data.map(
        async (recoveringState: TrendingStateJump): Promise<RecoveringState> =>
          await this.findOrCreateRecoveringState(recoveringState)
      )
    );
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
    const record: StarSystem = await repo.updateOneOrCreate({
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      systemCoordinates: await this.findOrCreateSystemCoordinates(data.StarPos),
      government: await this.findOrCreateGovernment(data.SystemGovernment),
      allegiance: await this.findOrCreateAllegiance(data.SystemAllegiance),
      systemEconomy: await this.findOrCreateSystemEconomy(data),
      primaryFaction: await this.findOrCreatePrimarySystemFaction(
        data.SystemAddress,
        data.SystemFaction
      ),
      securityLevel: await this.findOrCreateSecurityLevel(data.SystemSecurity),
      systemFactions: await this.findOrCreateSystemFactionArray(
        data.SystemAddress,
        data.Factions
      ),
      powerplayState: await this.findOrCreatePowerplayState(
        data.PowerplayState
      ),
      systemPowers: await this.findOrCreatePowerArray(data.Powers),
      thargoidWar: await this.findOrCreateThargoidWar(
        data.SystemAddress,
        data.ThargoidWar
      ),
      systemConflicts: await this.findOrCreateSystemConflictArray(
        data.SystemAddress,
        data.Conflicts
      )
    });

    if (!record.hasId()) await repo.save(record);
    return record;
  }

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
    return Promise.all(
      data.map(
        async (systemConflict: SystemConflictJump): Promise<SystemConflict> =>
          await this.findOrCreateSystemConflict(systemAddress, systemConflict)
      )
    );
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
    return Promise.all(
      data.map(
        async (systemFaction: SystemFactionJump): Promise<SystemFaction> =>
          (await this.findOrCreateSystemFaction(
            systemAddress,
            systemFaction
          )) as SystemFaction
      )
    );
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
    const record: SystemFaction = await repo.findOrCreate({
      systemAddress: systemAddress,
      allegiance: await this.findOrCreateAllegiance(data.Allegiance),
      government: await this.findOrCreateGovernment(data.Government),
      happiness: await this.findOrCreateHappiness(data.Happiness),
      faction: await this.findOrCreateFaction(data.Name),
      factionState: await this.findOrCreateFactionState(data.FactionState),
      activeStates: await this.findOrCreateActiveStateArray(data.ActiveStates),
      pendingStates: await this.findOrCreatePendingStateArray(
        data.PendingStates
      ),
      recoveringStates: await this.findOrCreateRecoveringStatesArray(
        data.RecoveringStates
      )
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

// import Allegiance from "@api/models/allegiance";
// import Economy from "@api/models/economy";
// import Faction from "@api/models/faction";
// import FactionState from "@api/models/factionState";
// import Government from "@api/models/government";
// import HappinessLevel from "@api/models/happiness";
// import PendingState from "@api/models/pendingState";
// import Power from "@api/models/power";
// import PowerplayState from "@api/models/powerplayState";
// import PrimarySystemFaction from "@api/models/primarySystemFaction";
// import RecoveringState from "@api/models/recoveringState";
// import SecurityLevel from "@api/models/securityLevel";
// import StarSystem from "@api/models/starSystem";
// import SystemConflict from "@api/models/systemConflict";
// import SystemCoordinates from "@api/models/systemCoordinates";
// import SystemEconomy from "@api/models/systemEconomy";
// import SystemFaction from "@api/models/systemFaction";
// import ThargoidWar from "@api/models/thargoidWar";
// import ThargoidWarState from "@api/models/thargoidWarState";
// import AllegianceService from "@api/services/allegiance";
// import EconomyService from "@api/services/economy";
// import FactionService from "@api/services/faction";
// import FactionStateService from "@api/services/factionState";
// import GovernmentService from "@api/services/government";
// import HappinessService from "@api/services/happiness";
// import PendingStateService from "@api/services/pendingState";
// import PowerService from "@api/services/power";
// import PowerplayStateService from "@api/services/powerplayState";
// import PrimarySystemFactionService from "@api/services/primarySystemFaction";
// import RecoveringStateService from "@api/services/recoveringState";
// import SecurityLevelService from "@api/services/securityLevel";
// import StarSystemService from "@api/services/starSystem";
// import SystemCoordinatesService from "@api/services/systemCoordinates";
// import SystemEconomyService from "@api/services/systemEconomy";
// import SystemFactionService from "@api/services/systemFaction";
// import ThargoidWarService from "@api/services/thargoidWar";
// import ThargoidWarStateService from "@api/services/thargoidWarState";
// import {
//   EconomyParams,
//   GovernmentParams,
//   SystemFactionParams,
//   toAllegiance,
//   toGovernment,
//   toStarSystem,
//   toSystemCoordinates,
//   toThargoidWar
// } from "@utils/eventConverters";
// import { hasOwnProperty } from "@utils/prototypeHelpers";
// import { Service, Inject } from "typedi";
// import { DataSource, EntityManager } from "typeorm";
// import { Logger } from "winston";

// @Service()
// export default class FSDJumpService {
//   private manager?: EntityManager;

//   constructor(
//     @Inject("dataSource")
//     private readonly dataSource: DataSource,
//     @Inject("logger")
//     private logger: Logger
//   ) {}

//   public async handleFSDJumpEvent(data: FSDJumpData): Promise<void> {
//     return this.dataSource.transaction(async (manager: EntityManager) => {
//       this.manager = manager;
//       if (data.Body) this.logger.info("JUMP TO BODY");
//       else this.logger.info("NO BODY AT JUMP POINT?");
//       await this.findOrCreateSystem(data);
//     });
//   }

//   private async updateOrCreateSystem(data: FSDJumpData): Promise<void> {
//     const repository = new StarSystemService(this.manager || this.dataSource);

//     let systemRecord: StarSystem | null = await repository.findBySystemAddress(
//       data.SystemAddress
//     );
//     if (systemRecord) {
//       /**
//        * @TODO - Update
//        */
//       return;
//     }

//     systemRecord = new StarSystem();
//     systemRecord.population = data.Population;
//     systemRecord.systemCoordinates = await this.findOrCreateSystemCoordinates(
//       data
//     );
//     systemRecord.government = await this.findOrCreateGovernment(data);
//     systemRecord.allegiance = await this.findOrCreateAllegiance(data);
//     systemRecord.systemEconomy = await this.findOrCreateSystemEconomy(data);
//     systemRecord.primaryFaction = await this.findOrCreatePrimaryFaction(data);
//     systemRecord.securityLevel = await this.findOrCreateSecurityLevel(data);
//     systemRecord.systemFactions = await this.findOrCreateSystemFactions(data);
//     systemRecord.powerplayState = await this.findOrCreatePowerplayState(data);
//     systemRecord.systemPowers = await this.findOrCreatePowers(data);
//     systemRecord.thargoidWar = await this.findOrCreateThargoidWar(data);
//     systemRecord.systemConflicts = await this.findOrCreateSystemConflicts(data);
//     systemRecord.createdAt = new Date(data.timestamp);
//     systemRecord.updatedAt = new Date(data.timestamp);
//   }

//   private async findOrCreateSystemConflicts(
//     data: FSDJumpData
//   ): Promise<SystemConflict[] | undefined> {
//     if(!data.Conflicts) return;

//   }

//   private async findOrCreateSystem(data: FSDJumpData): Promise<void> {
//     const systemCoordinatesRecord = await this.findOrCreateSystemCoordinates(
//       data
//     );
//     const systemAllegianceRecord = await this.findOrCreateAllegiance(data);
//     const systemGovernmentRecord = await this.findOrCreateGovernment(data);
//     const systemSecurityRecord = await this.findOrCreateSecurityLevel(data);
//     const powerplayStateRecord = await this.findOrCreatePowerplayState(data);
//     const powerRecords = await this.findOrCreatePowers(data);

//     const { systemAddress, systemName, population } = toStarSystem(data);

//     const systemEconomyRecord = await this.findOrCreateSystemEconomy(data);

//     const repo = new StarSystemService(this.manager || this.dataSource);
//     const systemRecord = await repo.findOneOrCreateBase(
//       systemAddress,
//       systemName
//     );

//     systemRecord.systemCoordinates = systemCoordinatesRecord;
//     if (systemAllegianceRecord)
//       systemRecord.allegiance = systemAllegianceRecord;
//     systemRecord.government = systemGovernmentRecord;
//     systemRecord.population = population;
//     systemRecord.securityLevel = systemSecurityRecord;
//     systemRecord.systemEconomy = systemEconomyRecord;
//     if (powerplayStateRecord)
//       systemRecord.powerplayState = powerplayStateRecord;
//     systemRecord.systemPowers = powerRecords;

//     if (systemRecord.primaryFactionId) {
//       systemRecord.primaryFaction = (await this.updatePrimaryFaction(
//         systemRecord.primaryFactionId,
//         data
//       )) as PrimarySystemFaction;
//     } else if (hasOwnProperty(data, "SystemFaction")) {
//       const primarySystemFactionRecord = await this.findOrCreatePrimaryFaction(
//         data
//       );
//       systemRecord.primaryFaction =
//         primarySystemFactionRecord as PrimarySystemFaction;
//     }
//     await repo.save(systemRecord);

//     await this.findOrCreateThargoidWar(data);
//     systemRecord.systemFactions = await this.findOrCreateSystemFactions(data);
//     await repo.save(systemRecord);
//   }

//   private async findOrCreateSystemFactions(
//     data: FSDJumpData
//   ): Promise<SystemFaction[]> {
//     const systemFactionRecords: SystemFaction[] = [];
//     if (!data.Factions || data.Factions.length === 0)
//       return systemFactionRecords;

//     const output: SystemFaction[] = [];
//     for (const systemFactionData of data.Factions) {
//       const sysFac = await this.findOrCreateSystemFaction(
//         data.SystemAddress,
//         systemFactionData
//       );

//       output.push(sysFac);
//     }
//     return output;
//   }

//   private async findOrCreateActiveStates(
//     data: SystemFactionJump
//   ): Promise<FactionState[] | undefined> {
//     if (!data.ActiveStates) return;

//     const factionStateRepo = new FactionStateService(
//       this.manager || this.dataSource
//     );

//     const activeStates: FactionState[] = [];

//     for (const activeStateParams of data.ActiveStates) {
//       const record = await factionStateRepo.findOneOrCreate(
//         activeStateParams.State
//       );
//       activeStates.push(record);
//     }

//     return activeStates;
//   }

//   private async findOrCreatePendingStates(
//     systemFaction: SystemFaction,
//     data: SystemFactionJump
//   ): Promise<PendingState[] | undefined> {
//     if (!data.PendingStates) return;

//     const pendingStateRepo = new PendingStateService(
//       this.manager || this.dataSource
//     );

//     const pendingStates: PendingState[] = [];

//     for (const pendingStateParams of data.PendingStates) {
//       const factionStateRecord = (await this.findOrCreateFactionState(
//         pendingStateParams.State
//       )) as FactionState;
//       const pendingStateRecord = new PendingState();
//       pendingStateRecord.factionState = factionStateRecord;
//       pendingStateRecord.trend = pendingStateParams.Trend;
//       pendingStateRecord.systemFaction = systemFaction;
//       await pendingStateRepo.save(pendingStateRecord);
//     }

//     return pendingStates;
//   }

//   private async findOrCreateRecoveringStates(
//     systemFaction: SystemFaction,
//     data: SystemFactionJump
//   ): Promise<RecoveringState[] | undefined> {
//     if (!data.RecoveringStates) return;

//     const recoveringStateRepo = new RecoveringStateService(
//       this.manager || this.dataSource
//     );

//     const recoveringStates: RecoveringState[] = [];

//     for (const recoveringStateParams of data.RecoveringStates) {
//       const factionStateRecord = (await this.findOrCreateFactionState(
//         recoveringStateParams.State
//       )) as FactionState;
//       const recoveringStateRecord = new RecoveringState();
//       recoveringStateRecord.factionState = factionStateRecord;
//       recoveringStateRecord.trend = recoveringStateParams.Trend;
//       recoveringStateRecord.systemFaction = systemFaction;
//       await recoveringStateRepo.save(recoveringStateRecord);
//     }

//     return recoveringStates;
//   }

//   private async findOrCreateSystemFaction(
//     systemAddress: number,
//     data: SystemFactionJump
//   ): Promise<SystemFaction> {
//     const allegianceRecord = await this.findOrCreateAllegiance(data.Allegiance);
//     const governmentRecord = await this.findOrCreateGovernment(data.Government);
//     const happinessRecord = await this.findOrCreateHappiness(data.Happiness);
//     const factionRecord = await this.findOrCreateFaction(data.Name);
//     const factionStateRecord = await this.findOrCreateFactionState(
//       data.FactionState
//     );

//     const repo = new SystemFactionService(this.manager || this.dataSource);
//     const systemFactionRecord = await repo.findOneOrCreate(
//       systemAddress,
//       allegianceRecord as Allegiance,
//       governmentRecord,
//       happinessRecord,
//       factionRecord,
//       factionStateRecord as FactionState
//     );
//     await repo.save(systemFactionRecord);
//     if (data.ActiveStates) {
//       await this.findOrCreateActiveStates(data);
//     }
//     if (data.PendingStates) {
//       await this.findOrCreatePendingStates(systemFactionRecord, data);
//     }

//     if (data.RecoveringStates) {
//       await this.findOrCreateRecoveringStates(systemFactionRecord, data);
//     }

//     return systemFactionRecord;
//   }

//   private async findOrCreateHappiness(
//     happiness: string
//   ): Promise<HappinessLevel> {
//     const repo = new HappinessService(this.manager || this.dataSource);
//     return repo.findOneOrCreate(happiness);
//   }

//   private async findOrCreatePowers(data: FSDJumpData): Promise<Power[]> {
//     if (!data.Powers || data.Powers.length === 0) return [];

//     const repo = new PowerService(this.manager || this.dataSource);
//     return repo.bulkFindOrCreate(data.Powers);
//   }

//   private async findOrCreatePowerplayState(
//     data: FSDJumpData
//   ): Promise<PowerplayState | undefined> {
//     const repo = new PowerplayStateService(this.manager || this.dataSource);

//     if (!data.PowerplayState) return;

//     return repo.findOneOrCreate(data.PowerplayState);
//   }

//   private async updatePrimaryFaction(
//     id: number,
//     data: FSDJumpData
//   ): Promise<PrimarySystemFaction | undefined> {
//     if (!data.SystemFaction) return;
//     const repo = new PrimarySystemFactionService(
//       this.manager || this.dataSource
//     );
//     const factionRecord = await this.findOrCreateFaction(
//       data.SystemFaction.Name
//     );
//     let factionStateRecord;
//     if (data.SystemFaction.FactionState) {
//       factionStateRecord = await this.findOrCreateFactionState(
//         data.SystemFaction.FactionState
//       );
//     }

//     return repo.findOneAndUpdate(
//       data.SystemAddress,
//       factionRecord,
//       factionStateRecord
//     );
//   }

//   private async findOrCreatePrimaryFaction(
//     data: FSDJumpData
//   ): Promise<PrimarySystemFaction | undefined> {
//     const repo = new PrimarySystemFactionService(
//       this.manager || this.dataSource
//     );

//     if (!data.SystemFaction) return;
//     const factionRecord = await this.findOrCreateFaction(
//       data.SystemFaction.Name
//     );
//     const factionStateRecord = data.SystemFaction.FactionState
//       ? await this.findOrCreateFactionState(data.SystemFaction.FactionState)
//       : undefined;

//     const systemFactionRecord = await repo.findOneOrCreate(
//       data.SystemAddress,
//       factionRecord,
//       factionStateRecord
//     );
//     // await repo.save(systemFactionRecord);
//     return systemFactionRecord;
//   }

//   private async findOrCreateSecurityLevel(
//     data: FSDJumpData
//   ): Promise<SecurityLevel | undefined> {
//     const repo = new SecurityLevelService(this.manager || this.dataSource);
//     return repo.findOneOrCreate(data.SystemSecurity);
//   }

//   private async findOrCreateSystemEconomy(
//     data: FSDJumpData
//   ): Promise<SystemEconomy> {
//     const repo = new SystemEconomyService(this.manager || this.dataSource);

//     const primaryEconomyRecord = await this.findOrCreateEconomy(
//       data.SystemEconomy
//     );
//     const secondaryEconomyRecord = await this.findOrCreateEconomy(
//       data.SystemSecondEconomy
//     );
//     const systemEconomy = await repo.findOneOrCreate(
//       primaryEconomyRecord,
//       secondaryEconomyRecord
//     );
//     if (!systemEconomy.id) await repo.save(systemEconomy);

//     return systemEconomy;
//   }

//   private async findOrCreateSystemCoordinates(
//     data: FSDJumpData
//   ): Promise<SystemCoordinates> {
//     const params = toSystemCoordinates(data);
//     if (!params) throw "no";
//     const repo = new SystemCoordinatesService(this.manager || this.dataSource);
//     const { x, y, z } = params;
//     return repo.findOneOrCreate(x, y, z);
//   }

//   private async findOrCreateFactionState(
//     factionState: string
//   ): Promise<FactionState | undefined> {
//     if (!factionState) return;
//     const repo = new FactionStateService(this.manager || this.dataSource);
//     return repo.findOneOrCreate(factionState);
//   }

//   private async findOrCreateFaction(faction: string): Promise<Faction> {
//     const repo = new FactionService(this.manager || this.dataSource);
//     return repo.findOneOrCreate(faction);
//   }

//   private async findOrCreateEconomy(economy: string): Promise<Economy> {
//     const repo = new EconomyService(this.manager || this.dataSource);
//     const economyRecord = await repo.findOneOrCreate(economy);
//     return economyRecord;
//     // await repo.save(economyRecord);
//     // return economy;
//   }

//   private async findOrCreateAllegiance(
//     data: FSDJumpData | string
//   ): Promise<Allegiance | undefined> {
//     if (typeof data === "string") {
//       const repo = new AllegianceService(this.manager || this.dataSource);
//       return repo.findOneOrCreate(data);
//     }

//     const allegianceParams = toAllegiance(data);
//     if (allegianceParams) {
//       // const repo = this.getRepo(Allegiance);
//       const repo = new AllegianceService(
//         this.manager ? this.manager : this.dataSource
//       );
//       const allegiance = await repo.findOneOrCreate(
//         allegianceParams.allegiance
//       );
//       if (!allegiance.id) await repo.save(allegiance);
//       return allegiance;
//     }
//   }

//   private async findOrCreateGovernment(
//     data: FSDJumpData | string
//   ): Promise<Government> {
//     if (typeof data === "string") {
//       const repo = new GovernmentService(this.manager || this.dataSource);
//       return repo.findOneOrCreate(data);
//     }
//     const governmentParams = toGovernment(data) as GovernmentParams;
//     // if (governmentParams) {
//     const repo = new GovernmentService(this.manager || this.dataSource);
//     const government = await repo.findOneOrCreate(governmentParams.government);
//     if (!government.id) await repo.save(government);
//     return government;
//     // }
//   }

//   // private async findOrCreateSystemConflict()

//   private async findOrCreateThargoidWar(
//     data: FSDJumpData
//   ): Promise<ThargoidWar | undefined> {
//     const thargoidWarParams = toThargoidWar(data);
//     if (!thargoidWarParams) return;

//     const {
//       systemAddress,
//       currentState,
//       estimatedRemainingTime,
//       nextStateFailure,
//       nextStateSuccess,
//       remainingPorts,
//       successStateReached,
//       warProgress
//     } = thargoidWarParams;

//     const repo = new ThargoidWarService(this.manager || this.dataSource);

//     const currentStateRecord = await this.findOrCreateThargoidWarState(
//       currentState
//     );
//     const nextStateFailureRecord = await this.findOrCreateThargoidWarState(
//       nextStateFailure
//     );
//     const nextStateSuccessRecord = await this.findOrCreateThargoidWarState(
//       nextStateSuccess
//     );

//     const thargoidWarRecord = await repo.findOneOrCreate(
//       systemAddress,
//       currentStateRecord.id,
//       estimatedRemainingTime,
//       nextStateFailureRecord.id,
//       nextStateSuccessRecord.id,
//       remainingPorts,
//       successStateReached,
//       warProgress
//     );

//     return thargoidWarRecord;
//   }

//   private async findOrCreateThargoidWarState(
//     warState: string
//   ): Promise<ThargoidWarState> {
//     const repo = new ThargoidWarStateService(this.manager || this.dataSource);

//     return repo.findOneOrCreate(warState);
//   }
// }
