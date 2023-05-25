import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import { Service, Inject } from "typedi";
import {
  BaseEntity,
  DataSource,
  EntityManager,
  EntityTarget,
  Repository
} from "typeorm";
import {
  EconomyParams,
  GovernmentParams,
  StationEconomyParams,
  toAllegiance,
  toEconomies,
  toGovernment,
  toLandingPadConfig,
  toStarSystem,
  toStation,
  toStationEconomies,
  toStationState,
  toStationType,
  toSystemCoordinates
} from "@utils/eventConverters";
import { Logger } from "winston";
import AllegianceRepository from "@api/repositories/allegiance.repository";
import StationRepository from "@api/repositories/station.repository";
import GovernmentRepository from "@api/repositories/government.repository";
import StationTypeRepository from "@api/repositories/stationType.repository";
import LandingPadConfigRepository from "@api/repositories/landingPadConfig.repository";
import SystemCoordinatesRepository from "@api/repositories/systemCoordinates.repository";
import StarSystemRepository from "@api/repositories/starSystem.repository";
import StationStateRepository from "@api/repositories/stationState.repository";
import StationEconomyRepository from "@api/repositories/stationEconomy.repository";
import EconomyRepository from "@api/repositories/economy.repository";
import ServiceOfferedRepository from "@api/repositories/serviceOffered.repository";
import FactionRepository from "@api/repositories/faction.repository";
import FactionStateRepository from "@api/repositories/factionState.repository";
import StationFactionRepository from "@api/repositories/stationFaction.repository";
import StationType from "@api/models/stationType.model";
import LandingPadConfig from "@api/models/landingPadConfig.model";
import SystemCoordinates from "@api/models/systemCoordinates.model";
import Station from "@api/models/station.model";
import StarSystem from "@api/models/starSystem.model";
import StationState from "@api/models/stationState.model";
import StationEconomy from "@api/models/stationEconomy.model";
import Economy from "@api/models/economy.model";
import ServiceOffered from "@api/models/serviceOffered.model";
import FactionState from "@api/models/factionState.model";
import Faction from "@api/models/faction.model";
import StationFaction from "@api/models/stationFaction.model";

interface IDockedService {
  handleDockedEvent: (data: DockedData) => Promise<void>;
}

@Service()
export default class DockedService implements IDockedService {
  private manager?: EntityManager;
  constructor(
    @Inject("dataSource")
    private readonly dataSource: DataSource,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async handleDockedEvent(data: DockedData): Promise<void> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      this.manager = manager;
      const starSystem = await this.findOrCreateStarSystem(data);
      await this.findOrCreateStation(data);

      // await starSystem.save();
    });
  }

  private async findOrCreateStarSystem(data: DockedData): Promise<StarSystem> {
    const params = toStarSystem(data);
    const coords = await this.findOrCreateSystemCoordinates(data);

    const repo = new StarSystemRepository(this.manager || this.dataSource);
    const { systemAddress, systemName } = params;
    const starSystem = await repo.findOneOrCreateBase(
      systemAddress,
      systemName,
      coords
    );
    await starSystem.save();
    return starSystem;
  }

  private async findOrCreateSystemCoordinates(
    data: DockedData
  ): Promise<SystemCoordinates> {
    const params = toSystemCoordinates(data);
    if (!params) throw "no";
    const repo = new SystemCoordinatesRepository(
      this.manager || this.dataSource
    );
    const { x, y, z } = params;
    return repo.findOneOrCreate(x, y, z);
  }

  private async findOrCreateStation(
    data: DockedData
  ): Promise<Station | undefined> {
    const allegiance = await this.findOrCreateAllegiance(data);
    const government = await this.findOrCreateGovernment(data);
    const stationType = await this.findOrCreateStationType(data);
    const landingPads = await this.findOrCreateLandingPadConfig(data);
    const stationState = await this.findOrCreateStationState(data);

    const repo = new StationRepository(this.manager || this.dataSource);
    const {
      systemAddress,
      marketId,
      stationName,
      distanceFromArrival,
      createdAt,
      updatedAt
    } = toStation(data);
    // const station = await repo.findOneOrCreate(
    //   systemAddress,
    //   marketId,
    //   stationName,
    //   distanceFromArrival,
    //   createdAt,
    //   updatedAt
    // );
    await this.manager
      ?.createQueryBuilder()
      .insert()
      .into(Station)
      .values({
        systemAddress,
        marketId,
        stationName,
        distanceFromArrival,
        createdAt,
        updatedAt
      })
      .orUpdate(
        [
          "allegiance_id",
          "government_id",
          "station_type_id",
          "landing_pad_configuration_id",
          "station_state_id",
          "station_faction_id",
          "updated_at"
        ],
        ["systemAddress"]
      )
      .execute();

    const station = (await repo.findByMarketId(marketId)) as Station;

    if (allegiance) station.allegiance = allegiance;

    station.government = government as Government;
    station.stationType = stationType;
    if (landingPads) station.landingPads = landingPads;
    station.stationState = stationState;

    await repo.save(station);
    const servicesOffered = await this.findOrCreateOfferedServices(data);

    station.servicesAvailable = servicesOffered;

    const stationEconomies: any[] = await this.findOrCreateStationEconomies(
      data
    );
    station.stationEconomies = stationEconomies;
    const stationFaction: StationFaction =
      await this.findOrCreateStationFaction(data);

    station.stationFaction = stationFaction;

    await repo.save(station);

    return station;
  }

  private async findOrCreateStationFaction(
    data: DockedData
  ): Promise<StationFaction> {
    const stationFactionParams: any = {
      faction: data.StationFaction.Name,
      factionState: data.StationFaction.FactionState,
      marketId: data.MarketID
    };

    const faction = await this.findOrCreateFaction(
      stationFactionParams.faction
    );

    let factionState;
    if (stationFactionParams.factionState) {
      factionState = await this.findOrCreateFactionState(
        stationFactionParams.factionState
      );
    }

    const repo = new StationFactionRepository(this.manager || this.dataSource);
    const stationFaction = await repo.findOneAndUpdate(
      data.MarketID,
      faction.id as number,
      factionState?.id
    );

    if (!stationFaction)
      return await repo.findOneOrCreate(
        data.MarketID,
        faction.id as number,
        factionState?.id
      );
    return stationFaction;
  }

  private async findOrCreateFactionState(
    factionState: string
  ): Promise<FactionState> {
    const repo = new FactionStateRepository(this.manager || this.dataSource);
    return repo.findOneOrCreate(factionState);
  }

  private async findOrCreateFaction(faction: string): Promise<Faction> {
    const repo = new FactionRepository(this.manager || this.dataSource);
    return repo.findOneOrCreate(faction);
  }

  private async findOrCreateStationEconomies(
    data: DockedData
  ): Promise<StationEconomy[]> {
    const stationEconomiesParamArr: StationEconomyParams[] =
      toStationEconomies(data);
    const repo = new StationEconomyRepository(this.manager || this.dataSource);
    const outputArr: StationEconomy[] = [];
    for (const stationEconomyParams of stationEconomiesParamArr) {
      const economy = await this.findOrCreateEconomy(
        stationEconomyParams.economyId as EconomyParams
      );

      const { stationId, proportion } =
        stationEconomyParams as StationEconomyParams;
      const stationEconomy = await repo.findOneOrCreate(
        stationId,
        economy.id as number,
        proportion
      );

      if (!stationEconomy.id) await repo.save(stationEconomy);

      outputArr.push(stationEconomy);
    }

    return outputArr;
  }

  private async findOrCreateEconomy(
    economyParams: EconomyParams
  ): Promise<Economy> {
    const repo = new EconomyRepository(this.manager || this.dataSource);
    const economy = await repo.findOneOrCreate(economyParams.economyName);
    if (economy.id) return economy;
    await repo.save(economy);
    return economy;
  }

  private async findOrCreateEconomies(data: DockedData): Promise<Economy[]> {
    const economies: Economy[] = [];
    const economyNames = toEconomies(data);

    if (!economyNames.length) return economies;
    const repo = new EconomyRepository(this.manager || this.dataSource);
    for (const economyName of economyNames) {
      const economy = await repo.findOneOrCreate(economyName);
      economies.push(economy);
    }

    return economies;
  }

  private findOrCreateStationState(data: DockedData): Promise<StationState> {
    const params = toStationState(data);
    const repo = new StationStateRepository(this.manager || this.dataSource);
    return repo.findOneOrCreate(params);
  }

  private getRepo<T extends BaseEntity>(model: EntityTarget<T>): Repository<T> {
    return this.manager
      ? this.manager.getRepository(model)
      : this.dataSource.getRepository(model);
  }

  private async findOrCreateAllegiance(
    data: DockedData
  ): Promise<Allegiance | undefined> {
    const allegianceParams = toAllegiance(data);
    if (allegianceParams) {
      // const repo = this.getRepo(Allegiance);
      const repo = new AllegianceRepository(
        this.manager ? this.manager : this.dataSource
      );
      const allegiance = await repo.findOneOrCreate(
        allegianceParams.allegiance
      );
      if (!allegiance.id) await repo.save(allegiance);
      return allegiance;
    }
  }

  private async findOrCreateGovernment(data: DockedData): Promise<Government> {
    const governmentParams = toGovernment(data) as GovernmentParams;
    // if (governmentParams) {
    const repo = new GovernmentRepository(this.manager || this.dataSource);
    const government = await repo.findOneOrCreate(governmentParams.government);
    if (!government.id) await repo.save(government);
    return government;
    // }
  }

  private async findOrCreateStationType(
    data: DockedData
  ): Promise<StationType> {
    const params = toStationType(data);
    const repo = new StationTypeRepository(this.manager || this.dataSource);
    return repo.findOneOrCreate(params);
  }

  private async findOrCreateLandingPadConfig(
    data: DockedData
  ): Promise<LandingPadConfig | undefined> {
    const params = toLandingPadConfig(data);
    if (!params) return;

    const repo = new LandingPadConfigRepository(
      this.manager || this.dataSource
    );

    return repo.findOneOrCreate(params.small, params.medium, params.large);
  }

  private async findOrCreateOfferedServices(
    data: DockedData
  ): Promise<ServiceOffered[]> {
    if (!data.StationServices.length) return [];
    const repo = new ServiceOfferedRepository(this.manager || this.dataSource);
    const output: ServiceOffered[] = [];
    for (const serviceParam of data.StationServices) {
      const service = await repo.findOneOrCreate(serviceParam);
      if (!service.id) await repo.save(service);

      output.push(service);
    }
    return output;
  }
}
