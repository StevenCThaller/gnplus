import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { EntityManager, Repository } from "typeorm";
import {
  Allegiance,
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
  SystemCoordinates,
  SystemEconomy,
  SystemFaction
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
    return this.queryService.transaction(async (transaction: EntityManager): Promise<void> => {
      const repo: Repository<StarSystem> = transaction.getRepository(StarSystem);

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
          await this.queryService.findOrCreateEntity(
            SystemCoordinates,
            { x: jumpData.StarPos[0], y: jumpData.StarPos[1], z: jumpData.StarPos[2] },
            transaction
          );

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
        this.upsertSystemAllegiance(record, jumpData.SystemAllegiance, transaction),
        this.upsertSystemGovernment(record, jumpData.SystemGovernment, transaction),
        this.upsertSystemSecurity(record, jumpData.SystemSecurity, transaction),
        this.upsertSystemPowers(record, jumpData.Powers, transaction),
        this.upsertSystemPowerplayState(record, jumpData.PowerplayState, transaction),
        this.upsertSystemEconomies(
          record,
          jumpData.SystemEconomy,
          jumpData.SystemSecondEconomy,
          transaction
        ),
        this.upsertPrimarySystemFaction(record, jumpData.SystemFaction, transaction)
      ]);

      await repo.save(record);

      await Promise.all([this.upsertSystemFactions(record, jumpData.Factions, transaction)]);
      await repo.save(record);
    });
  }

  private async upsertSystemFactions(
    starSystem: StarSystem,
    factions?: SystemFactionJump[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!factions || factions.length === 0) {
      starSystem.systemFactions = [];
      return;
    }

    const systemFactionRecords: SystemFaction[] = await Promise.all(
      factions.map(
        async (systemFaction: SystemFactionJump): Promise<SystemFaction> =>
          await this.findOrCreateSystemFaction(
            starSystem.systemAddress as number,
            systemFaction,
            entityManager
          )
      )
    );

    starSystem.systemFactions = systemFactionRecords;
  }

  private async upsertPrimarySystemFaction(
    starSystem: StarSystem,
    systemFaction?: PrimarySystemFactionJump,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!systemFaction) return;

    await this.findOrCreatePrimarySystemFaction(
      starSystem.systemAddress as number,
      systemFaction.Name,
      systemFaction.FactionState,
      entityManager
    );
  }

  private async findOrCreateSystemFaction(
    systemAddress: number,
    systemFaction: SystemFactionJump,
    entityManager?: EntityManager
  ): Promise<SystemFaction> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<SystemFaction> = entityManager.getRepository(SystemFaction);

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

    const factionRecord: Faction = await this.queryService.findOrCreateEntity(
      Faction,
      { factionName },
      entityManager
    );
    const happinessLevelRecord: HappinessLevel = await this.queryService.findOrCreateEntity(
      HappinessLevel,
      { happinessLevel },
      entityManager
    );
    const governmentRecord: Government = await this.queryService.findOrCreateEntity(
      Government,
      { government: `$government_${government};` },
      entityManager
    );
    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(
      Allegiance,
      { allegiance },
      entityManager
    );
    const factionStateRecord: FactionState | undefined = !factionState
      ? undefined
      : await this.queryService.findOrCreateEntity(FactionState, { factionState }, entityManager);

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
      this.upsertActiveStates(record, activeStates, entityManager),
      this.upsertPendingStates(record, pendingStates, entityManager),
      this.upsertRecoveringStates(record, recoveringStates, entityManager)
    ]);
    await repo.save(record);

    return record;
  }

  private async upsertRecoveringStates(
    systemFaction: SystemFaction,
    recoveringStates?: TrendingStateJump[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!recoveringStates || recoveringStates.length === 0) {
      systemFaction.recoveringStates = [];
      return;
    }

    const recoveringStateRecords: RecoveringState[] = await Promise.all(
      recoveringStates.map(
        async (recoveringState: TrendingStateJump): Promise<RecoveringState> =>
          await this.findOrCreateRecoveringState(
            recoveringState.State,
            recoveringState.Trend,
            entityManager
          )
      )
    );

    systemFaction.recoveringStates = recoveringStateRecords;
  }

  private async upsertPendingStates(
    systemFaction: SystemFaction,
    pendingStates?: TrendingStateJump[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!pendingStates || pendingStates.length === 0) {
      systemFaction.pendingStates = [];
      return;
    }

    const pendingStateRecords: PendingState[] = await Promise.all(
      pendingStates.map(
        async (pendingState: TrendingStateJump): Promise<PendingState> =>
          await this.findOrCreatePendingState(pendingState.State, pendingState.Trend, entityManager)
      )
    );

    systemFaction.pendingStates = pendingStateRecords;
  }

  private async findOrCreateRecoveringState(
    factionState: string,
    trend: number,
    entityManager?: EntityManager
  ): Promise<PendingState> {
    const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
      FactionState,
      { factionState },
      entityManager
    );
    return await this.queryService.findOrCreateEntity(
      RecoveringState,
      { factionStateId: factionStateRecord.id, trend },
      entityManager
    );
  }

  private async findOrCreatePendingState(
    factionState: string,
    trend: number,
    entityManager?: EntityManager
  ): Promise<PendingState> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();

    const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
      FactionState,
      { factionState },
      entityManager
    );
    return await this.queryService.findOrCreateEntity(
      PendingState,
      { factionStateId: factionStateRecord.id, trend },
      entityManager
    );
  }

  private async upsertActiveStates(
    systemFaction: SystemFaction,
    activeStates?: ActiveStateJump[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!activeStates || activeStates.length === 0) {
      systemFaction.activeStates = [];
      return;
    }

    const activeStateRecords: FactionState[] = await Promise.all(
      activeStates.map(
        async (activeState: ActiveStateJump): Promise<FactionState> =>
          await this.queryService.findOrCreateEntity(
            FactionState,
            { factionState: activeState.State },
            entityManager
          )
      )
    );

    systemFaction.activeStates = activeStateRecords;
  }

  private async findOrCreatePrimarySystemFaction(
    systemAddress: number,
    factionName: string,
    factionState?: string,
    entityManager?: EntityManager
  ): Promise<PrimarySystemFaction> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const factionRecord: Faction = await this.queryService.findOrCreateEntity(
      Faction,
      { factionName },
      entityManager
    );
    let factionStateRecord: FactionState | undefined;
    if (factionState)
      factionStateRecord = await this.queryService.findOrCreateEntity(
        FactionState,
        { factionState },
        entityManager
      );

    const repo: Repository<PrimarySystemFaction> =
      entityManager.getRepository(PrimarySystemFaction);

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
    secondaryEconomy?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!primaryEconomy) return;

    const primaryEconomyRecord: Economy = await this.queryService.findOrCreateEntity(
      Economy,
      { economyName: primaryEconomy },
      entityManager
    );
    let secondaryEconomyRecord: Economy | undefined;
    if (secondaryEconomy)
      secondaryEconomyRecord = await this.queryService.findOrCreateEntity(
        Economy,
        { economyName: secondaryEconomy },
        entityManager
      );

    const systemEconomyRecord: SystemEconomy = await this.queryService.findOrCreateEntity(
      SystemEconomy,
      { primaryEconomyId: primaryEconomyRecord.id, secondaryEconomyId: secondaryEconomyRecord?.id },
      entityManager
    );

    starSystem.systemEconomyId = systemEconomyRecord.id;
  }

  private async upsertSystemPowerplayState(
    starSystem: StarSystem,
    powerplayState?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!powerplayState) return;

    const powerplayStateRecord: PowerplayState = await this.queryService.findOrCreateEntity(
      PowerplayState,
      { powerplayState },
      entityManager
    );

    starSystem.powerplayStateId = powerplayStateRecord.id;
  }

  private async upsertSystemPowers(
    starSystem: StarSystem,
    systemPowers?: string[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!systemPowers || systemPowers.length === 0) return;

    const powerRecords: Power[] = await Promise.all(
      systemPowers.map(
        (powerName: string): Promise<Power> =>
          this.queryService.findOrCreateEntity(Power, { powerName }, entityManager)
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
    securityLevel?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!securityLevel) return;

    const securityLevelRecord: SecurityLevel = await this.queryService.findOrCreateEntity(
      SecurityLevel,
      { securityLevel },
      entityManager
    );
    starSystem.securityLevelId = securityLevelRecord.id;
  }

  private async upsertSystemAllegiance(
    starSystem: StarSystem,
    allegiance?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!allegiance) return;
    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(
      Allegiance,
      { allegiance },
      entityManager
    );
    starSystem.allegianceId = allegianceRecord.id;
  }

  private async upsertSystemGovernment(
    starSystem: StarSystem,
    government?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!government) return;

    const governmentRecord: Government = await this.queryService.findOrCreateEntity(
      Government,
      { government },
      entityManager
    );
    starSystem.governmentId = governmentRecord.id;
  }
}
