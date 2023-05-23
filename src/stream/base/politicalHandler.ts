import Allegiance from "@api/models/allegiance.model";
import Economy from "@api/models/economy.model";
import Faction from "@api/models/faction.model";
import FactionState from "@api/models/factionState.model";
import Government from "@api/models/government.model";
import SystemCoordinates from "@api/models/systemCoordinates.model";
import AllegianceRepository from "@api/repositories/allegiance";
import EconomyRepository from "@api/repositories/economy";
import FactionRepository from "@api/repositories/faction";
import FactionStateRepository from "@api/repositories/factionState";
import GovernmentRepository from "@api/repositories/government";
import SystemCoordinatesRepository from "@api/repositories/systemCoordinates";
import { Inject, Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

interface IPoliticalHandler<T> {
  processEventData(data: T): Promise<void>;
  findOrCreateAllegiance(allegiance: string): Promise<Allegiance | undefined>;
  findOrCreateEconomy(economy: string): Promise<Economy | undefined>;
  findOrCreateFaction(factionName: string): Promise<Faction | undefined>;
  findOrCreateFactionState(
    factionState: string
  ): Promise<FactionState | undefined>;
  findOrCreateGovernment(government: string): Promise<Government | undefined>;
  findOrCreateSystemCoordinates(
    starPos: number[]
  ): Promise<SystemCoordinates | undefined>;
  processEventData(data: T): Promise<void>;
}

@Service()
export default abstract class PoliticalHandler<T>
  implements IPoliticalHandler<T>
{
  protected manager?: EntityManager;
  @Inject("logger")
  protected logger!: Logger;
  /**
   *
   */
  constructor(protected dataSource: DataSource) {}

  public async handleEvent(data: T): Promise<void> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      this.manager = manager;
      await this.processEventData(data);
    });
  }

  /**
   *
   * @param {T} data - Event message from EDDN listener.
   */
  public async processEventData(data: T): Promise<void> {}

  /**
   *
   * @param {string} allegiance - Name of the allegiance needed
   * @returns
   */
  public async findOrCreateAllegiance(
    allegiance: string
  ): Promise<Allegiance | undefined> {
    if (!allegiance) return;
    const repo: AllegianceRepository = this.getRepo(AllegianceRepository);
    const record: Allegiance = await repo.findOneOrCreate(allegiance);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param {string} economy - Name of the economy needed
   * @returns
   */
  public async findOrCreateEconomy(
    economy: string
  ): Promise<Economy | undefined> {
    if (!economy) return;
    const repo: EconomyRepository = this.getRepo(EconomyRepository);
    const record: Economy = await repo.findOneOrCreate(economy);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param {string} factionName - Name of the faction needed
   * @returns
   */
  public async findOrCreateFaction(
    factionName: string
  ): Promise<Faction | undefined> {
    if (!factionName) return;
    const repo: FactionRepository = this.getRepo(FactionRepository);
    const record: Faction = await repo.findOneOrCreate(factionName);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param {string} factionState - Name of the faction state needed
   * @returns
   */
  public async findOrCreateFactionState(
    factionState: string
  ): Promise<FactionState | undefined> {
    if (!factionState) return;
    const repo: FactionStateRepository = this.getRepo(FactionStateRepository);
    const record: FactionState = await this.getRepo(
      FactionStateRepository
    ).findOneOrCreate(factionState);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param {string} government - Name of the government needed
   * @returns
   */
  public async findOrCreateGovernment(
    government: string
  ): Promise<Government | undefined> {
    if (!government) return;
    const repo: GovernmentRepository = this.getRepo(GovernmentRepository);
    const record: Government = await repo.findOneOrCreate(government);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateSystemCoordinates(
    starPos: number[]
  ): Promise<SystemCoordinates | undefined> {
    if (!starPos) return;
    const [x, y, z] = starPos;
    const repo: SystemCoordinatesRepository = this.getRepo(
      SystemCoordinatesRepository
    );
    const record: SystemCoordinates = await repo.findOneOrCreate(x, y, z);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param repository - Repository service class
   * @returns An actual repository service.
   */
  public getRepo<T>(repository: Newable<T>): T {
    return new repository(this.manager || this.dataSource);
  }
}
