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
    return this.queryService.transaction(async (transaction: EntityManager) => {
      const repo: Repository<Station> = transaction.getRepository(Station);

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
          },
          transaction
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
        this.upsertStationAllegiance(stationRecord, stationData.StationAllegiance, transaction),
        this.upsertStationGovernment(stationRecord, stationData.StationGovernment, transaction),
        this.upsertStationType(stationRecord, stationData.StationType, transaction),
        this.upsertLandingPadConfig(stationRecord, stationData.LandingPads, transaction),
        this.upsertStationState(stationRecord, stationData.StationState, transaction),
        this.upsertStationSystem(
          stationRecord,
          stationData.SystemAddress,
          stationData.StarSystem,
          stationData.StarPos,
          stationData.timestamp,
          transaction
        ),
        this.upsertStationFaction(stationRecord, stationData.StationFaction, transaction)
      ]);
      // this.logger.info("Station so far: %o", stationRecord);

      await repo.save(stationRecord);

      await Promise.all([
        this.upsertStationEconomies(stationRecord, stationData.StationEconomies, transaction),
        this.upsertStationServices(stationRecord, stationData.StationServices, transaction)
      ]);
    });
  }

  private async upsertStationAllegiance(
    station: Station,
    allegiance?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!allegiance) return;

    const allegianceRecord: Allegiance = await this.queryService.findOrCreateEntity(
      Allegiance,
      { allegiance },
      entityManager
    );
    station.allegianceId = allegianceRecord.id;
  }

  private async upsertStationEconomies(
    station: Station,
    stationEconomyData?: DockedStationEconomy[],
    entityManager?: EntityManager
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
        stationEconomy.Proportion,
        entityManager
      );
      stationEconomyRecords.push(stationEconomyRecord);
    }
  }

  private async upsertStationFaction(
    station: Station,
    stationFactionData: DockedStationFaction,
    entityManager?: EntityManager
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
        factionState,
        entityManager
      );
      station.stationFactionId = stationFactionRecord.id;
    }
  }

  private async upsertStationGovernment(
    station: Station,
    government: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!government) return;

    const governmentRecord: Government = await this.queryService.findOrCreateEntity(
      Government,
      { government },
      entityManager
    );
    station.governmentId = governmentRecord.id;
  }

  private async upsertStationServices(
    station: Station,
    servicesOffered: string[],
    entityManager?: EntityManager
  ): Promise<void> {
    if (!servicesOffered || servicesOffered.length === 0) {
      station.servicesAvailable = [];
      return;
    }
    const serviceOfferedRecords: ServiceOffered[] = await Promise.all(
      servicesOffered.map(
        async (service: string): Promise<ServiceOffered> =>
          await this.queryService.findOrCreateEntity(ServiceOffered, { service }, entityManager)
      )
    );

    station.servicesAvailable = serviceOfferedRecords;
  }

  private async upsertStationType(
    station: Station,
    stationType: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!stationType) return;

    const stationTypeRecord: StationType = await this.queryService.findOrCreateEntity(
      StationType,
      { stationType },
      entityManager
    );

    station.stationTypeId = stationTypeRecord.id;
  }

  private async upsertLandingPadConfig(
    stationRecord: Station,
    landingPads?: DockedLandingPads,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!landingPads) return;

    const landingPadRecord: LandingPadConfig = await this.queryService.findOrCreateEntity(
      LandingPadConfig,
      { small: landingPads.Small, medium: landingPads.Medium, large: landingPads.Large },
      entityManager
    );

    stationRecord.landingPadId = landingPadRecord.id;
  }

  private async upsertStationSystem(
    station: Station,
    systemAddress: number,
    starSystem: string,
    starPos: number[],
    timestamp: string,
    entityManager?: EntityManager
  ): Promise<void> {
    await this.queryService.findOrCreateBaseStarSystem(
      systemAddress,
      starSystem,
      starPos,
      timestamp,
      entityManager
    );

    station.systemAddress = systemAddress;
  }

  private async upsertStationState(
    station: Station,
    stationState?: string,
    entityManager?: EntityManager
  ): Promise<void> {
    if (!stationState) return;
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<StationState> = entityManager.getRepository(StationState);

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
    proportion: number,
    entityManager?: EntityManager
  ): Promise<StationEconomy> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<StationEconomy> = entityManager.getRepository(StationEconomy);

    let stationEconomyRecord: StationEconomy | null = await repo.findOne({
      relations: { economy: true },
      where: { stationId: stationId, economy: { economyName } }
    });

    if (!stationEconomyRecord) {
      const economyRecord: Economy = await this.queryService.findOrCreateEntity(
        Economy,
        { economyName },
        entityManager
      );
      stationEconomyRecord = new StationEconomy(stationId, economyRecord.id, proportion);
    } else if (stationEconomyRecord.economy?.economyName !== economyName) {
      const economyRecord: Economy = await this.queryService.findOrCreateEntity(
        Economy,
        { economyName },
        entityManager
      );
      stationEconomyRecord.economyId = economyRecord.id;
    } else {
      return stationEconomyRecord;
    }

    await repo.save(stationEconomyRecord);
    return stationEconomyRecord;
  }

  public async findOrCreateStationFaction(
    factionName: string,
    factionState?: string,
    entityManager?: EntityManager
  ): Promise<StationFaction> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<StationFaction> = entityManager.getRepository(StationFaction);

    let stationFactionRecord: StationFaction | null = await repo.findOne({
      relations: { faction: true, factionState: true },
      where: { faction: { factionName } }
    });

    if (!stationFactionRecord) {
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
      stationFactionRecord = new StationFaction(factionRecord.id, factionStateRecord?.id);
      await repo.save(stationFactionRecord);
    } else if (
      stationFactionRecord.factionState?.factionState !== factionState &&
      factionState !== undefined
    ) {
      const factionStateRecord: FactionState = await this.queryService.findOrCreateEntity(
        FactionState,
        { factionState },
        entityManager
      );
      stationFactionRecord.factionStateId = factionStateRecord.id;
      await repo.save(stationFactionRecord);
    }

    return stationFactionRecord;
  }
}
