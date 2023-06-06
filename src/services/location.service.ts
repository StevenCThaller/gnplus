import { Inject, Service } from "typedi";
import TransactionService from "./transaction.service";
import { EntityManager, Repository } from "typeorm";
import {
  Allegiance,
  Economy,
  Faction,
  FactionState,
  Government,
  LandingPadConfig,
  Market,
  Station,
  StationEconomy,
  StationFaction
} from "@models/index";
import { Logger } from "winston";

@Service()
export default class LocationService {
  private transactionService: TransactionService;
  private allegianceRepository: Repository<Allegiance>;
  private governmentRepository: Repository<Government>;
  private economyRepository: Repository<Economy>;
  private factionRepository: Repository<Faction>;
  private factionStateRepository: Repository<FactionState>;
  private landingPadRepository: Repository<LandingPadConfig>;
  private marketRepository: Repository<Market>;
  private stationRepository: Repository<Station>;
  private stationFactionRepository: Repository<StationFaction>;
  private stationEconomyRepository: Repository<StationEconomy>;
  private logger: Logger;

  constructor(@Inject() transactionService: TransactionService, @Inject("logger") logger: Logger) {
    this.transactionService = transactionService;
    this.allegianceRepository = transactionService.getEntityManager().getRepository(Allegiance);
    this.governmentRepository = transactionService.getEntityManager().getRepository(Government);
    this.economyRepository = transactionService.getEntityManager().getRepository(Economy);
    this.factionRepository = transactionService.getEntityManager().getRepository(Faction);
    this.factionStateRepository = transactionService.getEntityManager().getRepository(FactionState);
    this.landingPadRepository = transactionService
      .getEntityManager()
      .getRepository(LandingPadConfig);
    this.marketRepository = transactionService.getEntityManager().getRepository(Market);
    this.stationRepository = transactionService.getEntityManager().getRepository(Station);
    this.stationEconomyRepository = transactionService
      .getEntityManager()
      .getRepository(StationEconomy);
    this.stationFactionRepository = transactionService
      .getEntityManager()
      .getRepository(StationFaction);
    this.logger = logger;
  }

  private async findOrCreateMarket(marketId: number, timestamp: string): Promise<Market> {
    let marketRecord: Market | null = await this.marketRepository.findOne({
      where: { id: marketId }
    });

    if (!marketRecord) {
      marketRecord = new Market(marketId, new Date(timestamp));
      await this.marketRepository.save(marketRecord);
    }
    return marketRecord;
  }

  public async updateOrCreateStation(stationData: DockedData): Promise<void> {
    return this.transactionService.transaction(async (transaction: EntityManager) => {
      this.setRepositories(transaction);

      let stationRecord: Station | null = await this.stationRepository.findOne({
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
        await this.findOrCreateMarket(stationData.MarketID, stationData.timestamp);
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
        this.upsertStationEconomies(stationRecord, stationData.StationEconomies),
        this.upsertStationFaction(stationRecord, stationData.StationFaction),
        this.upsertStationGovernment(stationRecord, stationData.StationGovernment)
      ]);
    });
  }

  public async deleteStationEconomy(stationEconomyId: number): Promise<boolean> {
    try {
      await this.stationEconomyRepository.delete(stationEconomyId);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async findAndDeleteIrrelevantStationEconomies(
    newStationEconomies: DockedStationEconomy[],
    existingStationEconomies?: StationEconomy[]
  ): Promise<void> {
    if (!existingStationEconomies) return;

    for (const existingEconomy of existingStationEconomies) {
      if (
        !newStationEconomies.some(
          (incomingData: DockedStationEconomy): boolean =>
            existingEconomy.economy?.economyName === incomingData.Name &&
            existingEconomy.proportion === incomingData.Proportion
        )
      ) {
        await this.deleteStationEconomy(existingEconomy.id);
      }
    }
  }

  public async findOrCreateAllegiance(
    allegiance: string,
    entityManager?: EntityManager
  ): Promise<Allegiance> {
    if (entityManager) {
      this.allegianceRepository = entityManager.getRepository(Allegiance);
    }

    let allegianceRecord: Allegiance | null = await this.allegianceRepository.findOne({
      where: { allegiance }
    });

    if (!allegianceRecord) {
      allegianceRecord = new Allegiance(allegiance);
      await this.allegianceRepository.save(allegianceRecord);
    }

    return allegianceRecord;
  }

  public async findOrCreateEconomy(economyName: string): Promise<Economy> {
    let economyRecord: Economy | null = await this.economyRepository.findOne({
      where: { economyName }
    });

    if (!economyRecord) {
      economyRecord = new Economy(economyName);
      await this.economyRepository.save(economyRecord);
    }
    return economyRecord;
  }

  public async findOrCreateFaction(factionName: string): Promise<Faction> {
    let factionRecord: Faction | null = await this.factionRepository.findOne({
      where: { factionName }
    });

    if (!factionRecord) {
      factionRecord = new Faction(factionName);
      await this.factionRepository.save(factionRecord);
    }

    return factionRecord;
  }

  public async findOrCreateFactionState(factionState: string): Promise<FactionState> {
    let factionStateRecord: FactionState | null = await this.factionStateRepository.findOne({
      where: { factionState }
    });

    if (!factionStateRecord) {
      factionStateRecord = new FactionState(factionState);
      await this.factionStateRepository.save(factionStateRecord);
    }

    return factionStateRecord;
  }

  public async findOrCreateGovernment(government: string): Promise<Government> {
    let governmentRecord: Government | null = await this.governmentRepository.findOne({
      where: { government }
    });
    if (!governmentRecord) {
      governmentRecord = new Government(government);
      await this.governmentRepository.save(governmentRecord);
    }

    return governmentRecord;
  }

  public async findOrCreateLandingPads(
    small: number,
    medium: number,
    large: number
  ): Promise<LandingPadConfig> {
    let landingPadRecord: LandingPadConfig | null = await this.landingPadRepository.findOne({
      where: { small, medium, large }
    });

    if (!landingPadRecord) {
      landingPadRecord = new LandingPadConfig(small, medium, large);
      await this.landingPadRepository.save(landingPadRecord);
    }
    return landingPadRecord;
  }

  public async findOrCreateStationEconomy(
    stationId: number,
    economyName: string,
    proportion: number
  ): Promise<StationEconomy> {
    let stationEconomyRecord: StationEconomy | null = await this.stationEconomyRepository.findOne({
      relations: { economy: true },
      where: { stationId: stationId }
    });

    if (!stationEconomyRecord) {
      const economyRecord: Economy = await this.findOrCreateEconomy(economyName);
      stationEconomyRecord = new StationEconomy(stationId, economyRecord.id, proportion);
    } else if (stationEconomyRecord.economy?.economyName !== economyName) {
      const economyRecord: Economy = await this.findOrCreateEconomy(economyName);
      stationEconomyRecord.economyId = economyRecord.id;
    } else {
      return stationEconomyRecord;
    }

    await this.stationEconomyRepository.save(stationEconomyRecord);
    return stationEconomyRecord;
  }

  public async findOrCreateStationFaction(
    factionName: string,
    factionState?: string
  ): Promise<StationFaction> {
    let stationFactionRecord: StationFaction | null = await this.stationFactionRepository.findOne({
      relations: { faction: true, factionState: true },
      where: { faction: { factionName } }
    });

    if (!stationFactionRecord) {
      const factionRecord: Faction = await this.findOrCreateFaction(factionName);

      let factionStateRecord: FactionState | undefined;
      if (factionState) factionStateRecord = await this.findOrCreateFactionState(factionState);
      stationFactionRecord = new StationFaction(factionRecord.id, factionStateRecord?.id);
      await this.stationFactionRepository.save(stationFactionRecord);
    } else if (
      stationFactionRecord.factionState?.factionState !== factionState &&
      factionState !== undefined
    ) {
      const factionStateRecord: FactionState = await this.findOrCreateFactionState(factionState);
      stationFactionRecord.factionStateId = factionStateRecord.id;
      await this.stationFactionRepository.save(stationFactionRecord);
    }

    return stationFactionRecord;
  }

  private setRepositories(entityManager: EntityManager): void {
    this.allegianceRepository = entityManager.getRepository(Allegiance);
    this.governmentRepository = entityManager.getRepository(Government);
    this.economyRepository = entityManager.getRepository(Economy);
    this.factionRepository = entityManager.getRepository(Faction);
    this.factionStateRepository = entityManager.getRepository(FactionState);
    this.landingPadRepository = entityManager.getRepository(LandingPadConfig);
    this.marketRepository = entityManager.getRepository(Market);
    this.stationRepository = entityManager.getRepository(Station);
    this.stationEconomyRepository = entityManager.getRepository(StationEconomy);
    this.stationFactionRepository = entityManager.getRepository(StationFaction);
  }

  private async upsertStationAllegiance(station: Station, allegiance?: string): Promise<void> {
    if (!allegiance) return;

    const allegianceRecord: Allegiance = await this.findOrCreateAllegiance(allegiance);
    station.allegianceId = allegianceRecord.id;
  }

  private async upsertStationEconomies(
    station: Station,
    stationEconomyData?: DockedStationEconomy[]
  ): Promise<void> {
    if (!stationEconomyData) return;

    await this.findAndDeleteIrrelevantStationEconomies(
      stationEconomyData,
      station.stationEconomies
    );

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
    const governmentRecord: Government = await this.findOrCreateGovernment(government);
    station.governmentId = governmentRecord.id;
  }
}
