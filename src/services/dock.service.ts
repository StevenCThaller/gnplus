import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { Logger } from "winston";
import {
  Allegiance,
  Economy,
  Faction,
  FactionState,
  Government,
  LandingPadConfig,
  Market,
  ServiceOffered,
  StarSystem,
  Station,
  StationEconomy,
  StationFaction,
  StationState,
  StationType
} from "@models/index";
import { EntityManager, Repository } from "typeorm";

@Service()
export default class DockService {
  constructor(
    @Inject()
    private queryService: QueryService,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async updateOrCreateStation(stationData: DockedData): Promise<void> {
    return this.queryService.transaction(async () => {
      const repo: Repository<Station> = this.queryService.getRepository(Station);

      let stationRecord: Station | null = await repo.findOne({
        relations: {
          stationEconomies: {
            economy: true
          },
          stationFaction: {
            faction: true,
            factionState: true
          }
        },
        where: {
          id: stationData.MarketID
        }
      });

      if (!stationRecord) {
        await this.queryService.findOrCreateEntity(
          Market,
          { id: stationData.MarketID },
          {
            id: stationData.MarketID,
            createdAt: stationData.timestamp,
            updatedAt: stationData.timestamp
          }
        );
        stationRecord = new Station(
          stationData.MarketID,
          stationData.StationName,
          stationData.DistFromStarLS,
          new Date(stationData.timestamp)
        );
      } else {
        stationRecord.updatedAt = new Date(stationData.timestamp);
      }

      await Promise.all([
        this.upsertStationAllegiance(stationRecord, stationData.StationAllegiance),
        this.upsertStationGovernment(stationRecord, stationData.StationGovernment),
        this.upsertStationType(stationRecord, stationData.StationType),
        this.upsertLandingPadConfig(stationRecord, stationData.LandingPads),
        this.upsertStationState(stationRecord, stationData.StationState),
        this.upsertStationSystem(stationRecord, stationData),
        this.upsertStationFaction(stationRecord, stationData.StationFaction)
      ]);
      // this.logger.info("Station so far: %o", stationRecord);

      await repo.save(stationRecord);

      await Promise.all([
        this.upsertStationEconomies(stationRecord, stationData.StationEconomies),
        this.upsertStationServices(stationRecord, stationData.StationServices)
      ]);
    });
  }

  private async upsertStationAllegiance(station: Station, allegiance?: string): Promise<void> {
    if (!allegiance) return;

    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(Allegiance, {
      allegiance
    });
    station.allegianceId = allegianceRecord.id;
  }

  private async upsertStationEconomies(
    station: Station,
    stationEconomyData?: DockedStationEconomy[]
  ): Promise<void> {
    if (!stationEconomyData || stationEconomyData.length === 0) {
      station.stationEconomies = [];
      return;
    }

    const stationEconomyRecords: StationEconomy[] = [];
    for (const stationEconomy of stationEconomyData) {
      const stationEconomyRecord: StationEconomy = await this.findOrCreateStationEconomy(
        station.id,
        stationEconomy.Name,
        stationEconomy.Proportion
      );
      stationEconomyRecords.push(stationEconomyRecord);
    }
  }

  private async upsertStationFaction(
    station: Station,
    stationFactionData: DockedStationFaction
  ): Promise<void> {
    if (!stationFactionData) return;

    const factionName = stationFactionData.Name;
    const factionState = stationFactionData.FactionState;

    if (
      station.stationFaction?.faction?.factionName !== factionName ||
      station.stationFaction.factionState?.factionState !== factionState
    ) {
      const stationFactionRecord: StationFaction = await this.findOrCreateStationFaction(
        factionName,
        factionState
      );
      station.stationFactionId = stationFactionRecord.id;
    }
  }

  private async upsertStationGovernment(station: Station, government: string): Promise<void> {
    if (!government) return;

    const governmentRecord: Government = await this.queryService.findOrCreateEntity(Government, {
      government
    });
    station.governmentId = governmentRecord.id;
  }

  private async upsertStationServices(station: Station, servicesOffered: string[]): Promise<void> {
    if (!servicesOffered || servicesOffered.length === 0) {
      station.servicesAvailable = [];
      return;
    }
    const serviceOfferedRecords: ServiceOffered[] = await Promise.all(
      servicesOffered.map(
        async (service: string): Promise<ServiceOffered> =>
          await this.queryService.findOrCreateEntity(ServiceOffered, { service })
      )
    );

    station.servicesAvailable = serviceOfferedRecords;
  }

  private async upsertStationType(station: Station, stationType: string): Promise<void> {
    if (!stationType) return;

    const stationTypeRecord: StationType = await this.queryService.findOrCreateEntity(StationType, {
      stationType
    });

    station.stationTypeId = stationTypeRecord.id;
  }

  private async upsertLandingPadConfig(
    stationRecord: Station,
    landingPads?: DockedLandingPads
  ): Promise<void> {
    if (!landingPads) return;

    const landingPadRecord: LandingPadConfig = await this.queryService.findOrCreateEntity(
      LandingPadConfig,
      { small: landingPads.Small, medium: landingPads.Medium, large: landingPads.Large }
    );

    stationRecord.landingPadId = landingPadRecord.id;
  }

  private async upsertStationSystem(station: Station, dockedData: DockedData): Promise<void> {
    await this.queryService.findOrInsertBaseStarSystem(StarSystem.convertDocked(dockedData));

    station.systemAddress = dockedData.SystemAddress;
  }

  private async upsertStationState(station: Station, stationState?: string): Promise<void> {
    if (!stationState) return;
    const repo: Repository<StationState> = this.queryService.getRepository(StationState);

    let record: StationState | null = await repo.findOne({ where: { stationState } });

    if (!record) {
      record = new StationState(stationState);
      await repo.save(record);
    }

    station.stationStateId = record.id;
  }

  public async findOrCreateStationEconomy(
    stationId: number,
    economyName: string,
    proportion: number
  ): Promise<StationEconomy> {
    const repo: Repository<StationEconomy> = this.queryService.getRepository(StationEconomy);

    let stationEconomyRecord: StationEconomy | null = await repo.findOne({
      relations: { economy: true },
      where: { stationId: stationId, economy: { economyName } }
    });

    if (!stationEconomyRecord) {
      const economyRecord: Economy = await this.queryService.findOrCreateEntity(Economy, {
        economyName
      });
      stationEconomyRecord = new StationEconomy(stationId, economyRecord.id, proportion);
    } else if (stationEconomyRecord.economy?.economyName !== economyName) {
      const economyRecord: Economy = await this.queryService.findOrCreateEntity(Economy, {
        economyName
      });
      stationEconomyRecord.economyId = economyRecord.id;
    } else {
      return stationEconomyRecord;
    }

    await repo.save(stationEconomyRecord);
    return stationEconomyRecord;
  }

  public async findOrCreateStationFaction(
    factionName: string,
    factionState?: string
  ): Promise<StationFaction> {
    const repo: Repository<StationFaction> = this.queryService.getRepository(StationFaction);

    let stationFactionRecord: StationFaction | null = await repo.findOne({
      relations: { faction: true, factionState: true },
      where: { faction: { factionName } }
    });

    if (!stationFactionRecord) {
      const factionRecord: Faction = await this.queryService.findOrCreateEntity(Faction, {
        factionName
      });

      let factionStateRecord: FactionState | undefined;
      if (factionState)
        factionStateRecord = await this.queryService.findOrCreateEntity(FactionState, {
          factionState
        });
      stationFactionRecord = new StationFaction(factionRecord.id, factionStateRecord?.id);
      await repo.save(stationFactionRecord);
    } else if (
      stationFactionRecord.factionState?.factionState !== factionState &&
      factionState !== undefined
    ) {
      const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
        FactionState,
        { factionState }
      );
      stationFactionRecord.factionStateId = factionStateRecord.id;
      await repo.save(stationFactionRecord);
    }

    return stationFactionRecord;
  }
}
