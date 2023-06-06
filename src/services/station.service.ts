import {
  Allegiance,
  Government,
  LandingPadConfig,
  ServiceOffered,
  Station,
  StationEconomy,
  StationFaction,
  StationState,
  StationType
} from "@models/index";
import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import StationFactionService from "./stationFaction.service";
import StationEconomyService from "./stationEconomy.service";
import ServiceOfferedService from "./serviceOffered.service";
import StarSystemService from "./starSystem.service";
import Market from "@models/market.model";

@Service()
export default class StationService extends DatabaseService<Station> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, Station);
  }

  public async findByMarketId(id: number): Promise<Station | null> {
    return this.repository.findOne({
      where: { id: id },
      relations: {
        allegiance: true,
        government: true,
        stationType: true,
        landingPads: true,
        stationState: true,
        stationEconomies: {
          economy: true
        },
        stationFaction: {
          faction: true,
          factionState: true
        },
        servicesAvailable: true
      }
    });
  }

  public async findByName(stationName: string): Promise<Station | null> {
    return this.repository.findOne({
      where: { stationName },
      relations: {
        allegiance: true,
        government: true,
        stationType: true,
        landingPads: true,
        stationState: true,
        stationEconomies: {
          economy: true
        },
        stationFaction: {
          faction: true,
          factionState: true
        },
        servicesAvailable: true
      }
    });
  }

  public async findOrCreate(data: CreateStationParams): Promise<Station> {
    try {
      let station = await this.findByName(data.stationName as string);
      const {
        id,
        allegiance,
        government,
        stationType,
        landingPads,
        system,
        stationFaction,
        stationState,
        stationEconomies,
        servicesAvailable,
        ...rest
      } = data;
      if (!station) {
        station = this.repository.create({ id });
      }

      await Promise.all([
        this.upsertAllegiance(station, allegiance),
        this.upsertGovernment(station, government),
        this.upsertStationType(station, stationType),
        this.upsertLandingPads(station, landingPads),
        this.upsertStarSystem(station, system),
        this.upsertStationState(station, stationState),
        this.upsertStationFaction(station, stationFaction),
        this.upsertStationServices(station, servicesAvailable),
        this.upsertMarket(station.id)
      ]);

      await this.repository.save(station);

      return station;
    } catch (error) {
      this.logger.error("Error thrown while running StationService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertStationState(station: Station, stationState: string): Promise<void> {
    if (stationState) {
      const record: StationState = await this.findOrCreateEntity(StationState, { stationState });
      station.stationState = record;
    }
  }

  private async upsertMarket(marketId: number): Promise<void> {
    if (marketId) {
      await this.findOrCreateEntity(Market, { id: marketId });
    }
  }

  private async upsertStationServices(station: Station, services: string[]): Promise<void> {
    try {
      if (services) {
        const stationServices: ServiceOffered[] = await Promise.all(
          services.map(
            (service: string): Promise<ServiceOffered> =>
              this.getService(ServiceOfferedService).findOrCreate(service)
          )
        );
        station.servicesAvailable = stationServices;
      }
    } catch (error) {
      this.logger.error(
        "Error thrown while running StationService.upsertStationServices: %o",
        error
      );

      throw error;
    }
  }

  private async upsertAllegiance(station: Station, allegiance?: string): Promise<void> {
    try {
      // if (allegiance) {
      //   const allegianceRecord: Allegiance = await this.findOrCreateEntity(
      //     Allegiance,
      //     { allegiance },
      //     { allegiance }
      //   );
      //   station.allegiance = allegianceRecord;
      // }
    } catch (error) {
      this.logger.error("Error thrown while running StationService.upsertAllegiance: %o", error);

      throw error;
    }
  }

  private async upsertGovernment(station: Station, government?: string): Promise<void> {
    try {
      // if (government) {
      //   const governmentRecord: Government = await this.findOrCreateEntity(
      //     Government,
      //     { government },
      //     { government }
      //   );
      //   station.government = governmentRecord;
      // }
    } catch (error) {
      this.logger.error("Error thrown while running StationService.upsertGovernment: %o", error);

      throw error;
    }
  }

  private async upsertLandingPads(
    station: Station,
    landingPads?: LandingPadsParams
  ): Promise<void> {
    try {
      if (landingPads) {
        const record: LandingPadConfig = await this.findOrCreateEntity(
          LandingPadConfig,
          landingPads
        );
        station.landingPads = record;
      }
    } catch (error) {
      this.logger.error("Error thrown while running StationService.upsertLandingPads: %o", error);

      throw error;
    }
  }

  private async upsertStarSystem(station: Station, starSystem?: StarSystemParams): Promise<void> {
    try {
      if (starSystem) {
        const record = await this.getService(StarSystemService).findOrCreate(starSystem);
        station.starSystem = record;
      }
    } catch (error) {
      this.logger.error("Error thrown while running StationService.upsertStarSystem: %o", error);

      throw error;
    }
  }

  private async upsertStationEconomies(
    station: Station,
    economies?: StationEconomyParams[]
  ): Promise<void> {
    try {
      if (economies) {
        const stationEconomyService = this.getService(StationEconomyService);
        const stationEconomies: StationEconomy[] = await Promise.all(
          economies.map(
            (stationEconomy: StationEconomyParams): Promise<StationEconomy> =>
              stationEconomyService.findOrCreate(stationEconomy)
          )
        );
        station.stationEconomies = stationEconomies;
      }
    } catch (error) {
      this.logger.error(
        "Error thrown while running StationService.upsertStationEconomies: %o",
        error
      );

      throw error;
    }
  }

  private async upsertStationFaction(
    station: Station,
    stationFaction?: StationFactionParams
  ): Promise<void> {
    try {
      if (stationFaction) {
        const stationFactionService = this.getService(StationFactionService);
        const record: StationFaction = await stationFactionService.findOrCreate(stationFaction);
        station.stationFaction = record;
      }
    } catch (error) {
      this.logger.error(
        "Error thrown while running StationService.upsertStationFaction: %o",
        error
      );

      throw error;
    }
  }

  private async upsertStationType(station: Station, stationType?: string): Promise<void> {
    try {
      if (stationType) {
        const record: StationType = await this.findOrCreateEntity(
          StationType,
          { stationType },
          { stationType }
        );
        station.stationType = record;
      }
    } catch (error) {
      this.logger.error("Error thrown while running StationService.upsertStationType: %o", error);
      throw error;
    }
  }
}
