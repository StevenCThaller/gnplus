import { AppDataSource } from "@datasource";
import LoggerInstance from "@loaders/logger";
import { StarSystem, SystemCoordinates } from "@models/index";
import { isNumber } from "@utils/numbers.utils";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Service } from "typedi";
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository
} from "typeorm";
import { Logger } from "winston";

@Service()
export default class QueryService {
  private entityManager: EntityManager;
  private logger: Logger;
  constructor() {
    this.entityManager = AppDataSource.createEntityManager();
    this.logger = LoggerInstance;
  }

  public getEntityManager(): EntityManager {
    return this.entityManager;
  }

  public getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    return this.entityManager.getRepository(entity);
  }

  public resetEntityManager(): void {
    this.entityManager = AppDataSource.createEntityManager();
  }

  public async saveRecord<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    record: T
  ): Promise<void> {
    await this.getRepository(entity).save(record);
  }

  public async transaction<T>(callback: (...params: any) => Promise<T>): Promise<T> {
    return this.entityManager.transaction(async (transaction: EntityManager) => {
      try {
        this.entityManager = transaction;
        const result: T = await callback(transaction);
        this.resetEntityManager();
        return result;
      } catch (error) {
        this.logger.error("Transaction error: %o", error);
        this.resetEntityManager();
        throw error;
      }
    });
  }

  public async findOrCreateEntity<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
    createOptions?: DeepPartial<T> | boolean,
    saveRecord?: boolean
  ): Promise<T> {
    if (createOptions && typeof createOptions !== "boolean") {
      createOptions = createOptions as DeepPartial<T>;
    } else if (!createOptions) {
      createOptions = findOptions as DeepPartial<T>;
    }

    if (saveRecord === undefined) saveRecord = true;

    const repo: Repository<T> = this.getRepository(entity);

    let record: T | null = await repo.findOne({ where: findOptions });

    if (!record) {
      record = repo.create(createOptions as DeepPartial<T>);

      if (saveRecord) await repo.save(record);
    }

    return record;
  }

  public async findOrCreateEntityWithRelations<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
    relationOptions: FindOptionsRelations<T>,
    createOptions?: DeepPartial<T> | EntityManager,
    entityManager?: EntityManager
  ): Promise<T> {
    if (createOptions && entityManager) {
      createOptions = createOptions as DeepPartial<T>;
    } else if (!entityManager && hasOwnProperty(createOptions, "connection")) {
      entityManager = createOptions as EntityManager;
      createOptions = findOptions as DeepPartial<T>;
    } else if (!entityManager && !createOptions) {
      entityManager = this.entityManager;
      createOptions = findOptions as DeepPartial<T>;
    } else if (!entityManager) entityManager = this.entityManager;
    const repo: Repository<T> = entityManager.getRepository(entity);

    let record: T | null = await repo.findOne({ where: findOptions, relations: relationOptions });

    if (!record) {
      record = repo.create(createOptions as DeepPartial<T>);
      await repo.save(record);
    }

    return record;
  }

  public sanitizeDTO(record: any): any {
    const keys: string[] = Object.keys(record);
    for (const key of keys) {
      if (record[key] === null || record[key] === undefined || record[key] === "")
        delete record[key];
      else if (isNumber(record[key])) record[key] = Number(record[key]);
      else if (typeof record[key] === "object") record[key] = this.sanitizeDTO(record[key]);
    }
    return record;
  }

  public async findOrInsertBaseStarSystem(params: BaseStarSystemParams): Promise<StarSystem> {
    const repo: Repository<StarSystem> = this.entityManager.getRepository(StarSystem);

    let record: StarSystem | null = await repo.findOne({
      where: { systemAddress: params.systemAddress }
    });

    if (record) return record;

    let systemCoordinatesId: number | undefined;
    if (!this.isSystemCoordinatesIncorrect(params))
      systemCoordinatesId = await this.findOrInsertSystemCoordinates(params.systemCoordinates);

    record = new StarSystem(
      params.systemAddress,
      params.systemName,
      systemCoordinatesId,
      params.timestamp
    );
    await repo.save(record);

    return record;
  }

  private isSystemCoordinatesIncorrect(params: BaseStarSystemParams): boolean {
    return (
      params.systemName.toLowerCase() !== "sol" &&
      params.systemCoordinates.x === 0 &&
      params.systemCoordinates.y === 0 &&
      params.systemCoordinates.z === 0
    );
  }

  public async findOrInsertSystemCoordinates(params: SystemCoordinatesParams): Promise<number> {
    const repo: Repository<SystemCoordinates> = this.getRepository(SystemCoordinates);
    const { x, y, z } = params;
    let record: SystemCoordinates | null = await repo.findOne({ where: { x, y, z } });
    if (record) return record.id as number;

    record = new SystemCoordinates(x, y, z);
    await repo.save(record);

    return record.id as number;
  }
}
