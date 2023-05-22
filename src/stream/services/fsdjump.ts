import Allegiance from "@api/models/allegiance";
import Economy from "@api/models/economy";
import Faction from "@api/models/faction";
import FactionState from "@api/models/factionState";
import Government from "@api/models/government";
import Power from "@api/models/power";
import PowerplayState from "@api/models/powerplayState";
import PrimarySystemFaction from "@api/models/primarySystemFaction";
import SecurityLevel from "@api/models/securityLevel";
import ServiceOffered from "@api/models/serviceOffered";
import StarSystem from "@api/models/starSystem";
import StationEconomy from "@api/models/stationEconomy";
import SystemCoordinates from "@api/models/systemCoordinates";
import SystemEconomy from "@api/models/systemEconomy";
import ThargoidWar from "@api/models/thargoidWar";
import ThargoidWarState from "@api/models/thargoidWarState";
import AllegianceService from "@api/services/allegiance";
import EconomyService from "@api/services/economy";
import FactionService from "@api/services/faction";
import FactionStateService from "@api/services/factionState";
import GovernmentService from "@api/services/government";
import PowerService from "@api/services/power";
import PowerplayStateService from "@api/services/powerplayState";
import PrimarySystemFactionService from "@api/services/primarySystemFaction";
import SecurityLevelService from "@api/services/securityLevel";
import StarSystemService from "@api/services/starSystem";
import SystemCoordinatesService from "@api/services/systemCoordinates";
import SystemEconomyService from "@api/services/systemEconomy";
import ThargoidWarService from "@api/services/thargoidWar";
import ThargoidWarStateService from "@api/services/thargoidWarState";
import {
  EconomyParams,
  GovernmentParams,
  toAllegiance,
  toGovernment,
  toStarSystem,
  toSystemCoordinates,
  toThargoidWar
} from "@utils/eventConverters";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Service, Inject } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class FSDJumpService {
  private manager?: EntityManager;

  constructor(
    @Inject("dataSource")
    private readonly dataSource: DataSource,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async handleFSDJumpEvent(data: FSDJumpData): Promise<void> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      this.manager = manager;
      await this.findOrCreateSystem(data);
    });
  }

  private async findOrCreateSystem(data: FSDJumpData): Promise<void> {
    const systemCoordinatesRecord = await this.findOrCreateSystemCoordinates(
      data
    );
    const systemAllegianceRecord = await this.findOrCreateAllegiance(data);
    const systemGovernmentRecord = await this.findOrCreateGovernment(data);
    const systemSecurityRecord = await this.findOrCreateSecurityLevel(data);
    const powerplayStateRecord = await this.findOrCreatePowerplayState(data);
    const powerRecords = await this.findOrCreatePowers(data);

    const { systemAddress, systemName, population } = toStarSystem(data);

    const systemEconomyRecord = await this.findOrCreateSystemEconomy(data);

    const repo = new StarSystemService(this.manager || this.dataSource);
    const systemRecord = await repo.findOneOrCreateBase(
      systemAddress,
      systemName
    );

    systemRecord.systemCoordinates = systemCoordinatesRecord;
    if (systemAllegianceRecord)
      systemRecord.allegiance = systemAllegianceRecord;
    systemRecord.government = systemGovernmentRecord;
    systemRecord.population = population;
    systemRecord.securityLevel = systemSecurityRecord;
    systemRecord.systemEconomy = systemEconomyRecord;
    if (powerplayStateRecord)
      systemRecord.powerplayState = powerplayStateRecord;
    systemRecord.systemPowers = powerRecords;

    if (systemRecord.primaryFactionId) {
      systemRecord.primaryFaction = (await this.updatePrimaryFaction(
        systemRecord.primaryFactionId,
        data
      )) as PrimarySystemFaction;
    } else if (hasOwnProperty(data, "SystemFaction")) {
      const primarySystemFactionRecord = await this.findOrCreatePrimaryFaction(
        data
      );
      systemRecord.primaryFaction =
        primarySystemFactionRecord as PrimarySystemFaction;
    }
    await repo.save(systemRecord);

    await this.findOrCreateThargoidWar(data);
  }

  private async findOrCreatePowers(data: FSDJumpData): Promise<Power[]> {
    if (!data.Powers || data.Powers.length === 0) return [];

    const repo = new PowerService(this.manager || this.dataSource);
    return repo.bulkFindOrCreate(data.Powers);
  }

  private async findOrCreatePowerplayState(
    data: FSDJumpData
  ): Promise<PowerplayState | undefined> {
    const repo = new PowerplayStateService(this.manager || this.dataSource);

    if (!data.PowerplayState) return;

    return repo.findOneOrCreate(data.PowerplayState);
  }

  private async updatePrimaryFaction(
    id: number,
    data: FSDJumpData
  ): Promise<PrimarySystemFaction | undefined> {
    if (!data.SystemFaction) return;
    const repo = new PrimarySystemFactionService(
      this.manager || this.dataSource
    );
    const factionRecord = await this.findOrCreateFaction(
      data.SystemFaction.Name
    );
    let factionStateRecord;
    if (data.SystemFaction.FactionState) {
      factionStateRecord = await this.findOrCreateFactionState(
        data.SystemFaction.FactionState
      );
    }

    return repo.findOneAndUpdate(
      data.SystemAddress,
      factionRecord,
      factionStateRecord
    );
  }

  private async findOrCreatePrimaryFaction(
    data: FSDJumpData
  ): Promise<PrimarySystemFaction | undefined> {
    const repo = new PrimarySystemFactionService(
      this.manager || this.dataSource
    );

    if (!data.SystemFaction) return;
    const factionRecord = await this.findOrCreateFaction(
      data.SystemFaction.Name
    );
    const factionStateRecord = data.SystemFaction.FactionState
      ? await this.findOrCreateFactionState(data.SystemFaction.FactionState)
      : undefined;

    const systemFactionRecord = await repo.findOneOrCreate(
      data.SystemAddress,
      factionRecord,
      factionStateRecord
    );
    // await repo.save(systemFactionRecord);
    return systemFactionRecord;
  }

  private async findOrCreateSecurityLevel(
    data: FSDJumpData
  ): Promise<SecurityLevel> {
    const repo = new SecurityLevelService(this.manager || this.dataSource);
    return repo.findOneOrCreate(data.SystemSecurity);
  }

  private async findOrCreateSystemEconomy(
    data: FSDJumpData
  ): Promise<SystemEconomy> {
    const repo = new SystemEconomyService(this.manager || this.dataSource);

    const primaryEconomyRecord = await this.findOrCreateEconomy(
      data.SystemEconomy
    );
    const secondaryEconomyRecord = await this.findOrCreateEconomy(
      data.SystemSecondEconomy
    );
    const systemEconomy = await repo.findOneOrCreate(
      primaryEconomyRecord,
      secondaryEconomyRecord
    );
    if (!systemEconomy.id) await repo.save(systemEconomy);

    return systemEconomy;
  }

  private async findOrCreateSystemCoordinates(
    data: FSDJumpData
  ): Promise<SystemCoordinates> {
    const params = toSystemCoordinates(data);
    if (!params) throw "no";
    const repo = new SystemCoordinatesService(this.manager || this.dataSource);
    const { x, y, z } = params;
    return repo.findOneOrCreate(x, y, z);
  }

  private async findOrCreateFactionState(
    factionState: string
  ): Promise<FactionState> {
    const repo = new FactionStateService(this.manager || this.dataSource);
    return repo.findOneOrCreate(factionState);
  }

  private async findOrCreateFaction(faction: string): Promise<Faction> {
    const repo = new FactionService(this.manager || this.dataSource);
    return repo.findOneOrCreate(faction);
  }

  private async findOrCreateEconomy(economy: string): Promise<Economy> {
    const repo = new EconomyService(this.manager || this.dataSource);
    const economyRecord = await repo.findOneOrCreate(economy);
    return economyRecord;
    // await repo.save(economyRecord);
    // return economy;
  }

  private async findOrCreateAllegiance(
    data: FSDJumpData
  ): Promise<Allegiance | undefined> {
    const allegianceParams = toAllegiance(data);
    if (allegianceParams) {
      // const repo = this.getRepo(Allegiance);
      const repo = new AllegianceService(
        this.manager ? this.manager : this.dataSource
      );
      const allegiance = await repo.findOneOrCreate(
        allegianceParams.allegiance
      );
      if (!allegiance.id) await repo.save(allegiance);
      return allegiance;
    }
  }

  private async findOrCreateGovernment(data: FSDJumpData): Promise<Government> {
    const governmentParams = toGovernment(data) as GovernmentParams;
    // if (governmentParams) {
    const repo = new GovernmentService(this.manager || this.dataSource);
    const government = await repo.findOneOrCreate(governmentParams.government);
    if (!government.id) await repo.save(government);
    return government;
    // }
  }

  // private async findOrCreateSystemConflict()

  private async findOrCreateThargoidWar(
    data: FSDJumpData
  ): Promise<ThargoidWar | undefined> {
    const thargoidWarParams = toThargoidWar(data);
    if (!thargoidWarParams) return;

    const {
      systemAddress,
      currentState,
      estimatedRemainingTime,
      nextStateFailure,
      nextStateSuccess,
      remainingPorts,
      successStateReached,
      warProgress
    } = thargoidWarParams;

    const repo = new ThargoidWarService(this.manager || this.dataSource);

    const currentStateRecord = await this.findOrCreateThargoidWarState(
      currentState
    );
    const nextStateFailureRecord = await this.findOrCreateThargoidWarState(
      nextStateFailure
    );
    const nextStateSuccessRecord = await this.findOrCreateThargoidWarState(
      nextStateSuccess
    );

    const thargoidWarRecord = await repo.findOneOrCreate(
      systemAddress,
      currentStateRecord.id,
      estimatedRemainingTime,
      nextStateFailureRecord.id,
      nextStateSuccessRecord.id,
      remainingPorts,
      successStateReached,
      warProgress
    );

    return thargoidWarRecord;
  }

  private async findOrCreateThargoidWarState(
    warState: string
  ): Promise<ThargoidWarState> {
    const repo = new ThargoidWarStateService(this.manager || this.dataSource);

    return repo.findOneOrCreate(warState);
  }
}
