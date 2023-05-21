import Allegiance from "@api/models/allegiance";
import Government from "@api/models/government";
import AllegianceService from "@api/services/allegiance";
import { StationService } from "@api/services/station";
import { All } from "@nestjs/common";
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
import GovernmentService from "@api/services/government";
import StationType from "@api/models/stationType";
import StationTypeService from "@api/services/stationType";
import LandingPadConfig from "@api/models/landingPadConfig";
import LandingPadConfigService from "@api/services/landingPadConfig";
import SystemCoordinates from "@api/models/systemCoordinates";
import SystemCoordinatesService from "@api/services/systemCoordinates";
import Station from "@api/models/station";
import StarSystemService from "@api/services/starSystem";
import StarSystem from "@api/models/starSystem";
import StationState from "@api/models/stationState";
import StationStateService from "@api/services/stationState";
import StationEconomy from "@api/models/stationEconomy";
import Economy from "@api/models/economy";
import EconomyService from "@api/services/economy";
import StationEconomyService from "@api/services/stationEconomy";
import ServiceOffered from "@api/models/serviceOffered";
import ServiceOfferedService from "@api/services/serviceOffered";
import FactionState from "@api/models/factionState";
import Faction from "@api/models/faction";
import FactionService from "@api/services/faction";
import FactionStateService from "@api/services/factionState";
import StationFaction from "@api/models/stationFaction";
import StationFactionService from "@api/services/stationFaction";

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

    params.systemCoordinates = coords.id as number;
    const repo = new StarSystemService(this.manager || this.dataSource);
    const { systemAddress, systemName } = params;
    const starSystem = await repo.findOneOrCreateBase(
      systemAddress,
      systemName
    );
    starSystem.systemCoordinates = coords;
    await starSystem.save();
    return starSystem;
  }

  private async findOrCreateSystemCoordinates(
    data: DockedData
  ): Promise<SystemCoordinates> {
    const params = toSystemCoordinates(data);
    if (!params) throw "no";
    const repo = new SystemCoordinatesService(this.manager || this.dataSource);
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

    const repo = new StationService(this.manager || this.dataSource);
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

    const repo = new StationFactionService(this.manager || this.dataSource);
    const stationFaction = await repo.findOneAndUpdate(
      data.MarketID,
      faction.id,
      factionState?.id
    );

    if (!stationFaction)
      return await repo.findOneOrCreate(
        data.MarketID,
        faction.id,
        factionState?.id
      );
    return stationFaction;
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

  private async findOrCreateStationEconomies(
    data: DockedData
  ): Promise<StationEconomy[]> {
    const stationEconomiesParamArr: StationEconomyParams[] =
      toStationEconomies(data);
    const repo = new StationEconomyService(this.manager || this.dataSource);
    const outputArr: StationEconomy[] = [];
    for (const stationEconomyParams of stationEconomiesParamArr) {
      const economy = await this.findOrCreateEconomy(
        stationEconomyParams.economyId as EconomyParams
      );

      const { stationId, proportion } =
        stationEconomyParams as StationEconomyParams;
      const stationEconomy = await repo.findOneOrCreate(
        stationId,
        economy.id,
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
    const repo = new EconomyService(this.manager || this.dataSource);
    const economy = await repo.findOneOrCreate(economyParams.economyName);
    if (economy.id) return economy;
    await repo.save(economy);
    return economy;
  }

  private async findOrCreateEconomies(data: DockedData): Promise<Economy[]> {
    const economies: Economy[] = [];
    const economyNames = toEconomies(data);

    if (!economyNames.length) return economies;
    const repo = new EconomyService(this.manager || this.dataSource);
    for (const economyName of economyNames) {
      const economy = await repo.findOneOrCreate(economyName);
      economies.push(economy);
    }

    return economies;
  }

  private findOrCreateStationState(data: DockedData): Promise<StationState> {
    const params = toStationState(data);
    const repo = new StationStateService(this.manager || this.dataSource);
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

  private async findOrCreateGovernment(data: DockedData): Promise<Government> {
    const governmentParams = toGovernment(data) as GovernmentParams;
    // if (governmentParams) {
    const repo = new GovernmentService(this.manager || this.dataSource);
    const government = await repo.findOneOrCreate(governmentParams.government);
    if (!government.id) await repo.save(government);
    return government;
    // }
  }

  private async findOrCreateStationType(
    data: DockedData
  ): Promise<StationType> {
    const params = toStationType(data);
    const repo = new StationTypeService(this.manager || this.dataSource);
    return repo.findOneOrCreate(params);
  }

  private async findOrCreateLandingPadConfig(
    data: DockedData
  ): Promise<LandingPadConfig | undefined> {
    const params = toLandingPadConfig(data);
    if (!params) return;

    const repo = new LandingPadConfigService(this.manager || this.dataSource);

    return repo.findOneOrCreate(params.small, params.medium, params.large);
  }

  private async findOrCreateOfferedServices(
    data: DockedData
  ): Promise<ServiceOffered[]> {
    if (!data.StationServices.length) return [];
    const repo = new ServiceOfferedService(this.manager || this.dataSource);
    const output: ServiceOffered[] = [];
    for (const serviceParam of data.StationServices) {
      const service = await repo.findOneOrCreate(serviceParam);
      if (!service.id) await repo.save(service);

      output.push(service);
    }
    return output;
  }
}
