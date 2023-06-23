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

  public async transaction<T>(callback: (transaction: EntityManager) => Promise<T>): Promise<T> {
    return this.entityManager.transaction(async (transaction: EntityManager) => {
      try {
        return await callback(transaction);
      } catch (error) {
        this.logger.error("Transaction error: %o", error);
        throw error;
      }
    });
  }

  public async findOrCreateEntity<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
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
    } else if (!entityManager) entityManager = this.getEntityManager();
    const repo: Repository<T> = entityManager.getRepository(entity);

    let record: T | null = await repo.findOne({ where: findOptions });

    if (!record) {
      record = repo.create(createOptions as DeepPartial<T>);
      await repo.save(record);
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

  public async findOrCreateBaseStarSystem(
    systemAddress: number,
    starSystem: string,
    systemCoordinates: number[],
    timestamp: string,
    entityManager?: EntityManager
  ): Promise<StarSystem> {
    if (!entityManager) entityManager = this.getEntityManager();
    const repo: Repository<StarSystem> = entityManager.getRepository(StarSystem);

    let record: StarSystem | null = await repo.findOne({ where: { systemAddress } });

    if (!record) {
      const systemCoordinatesRecord: SystemCoordinates = await this.findOrCreateSystemCoordinates(
        systemCoordinates[0],
        systemCoordinates[1],
        systemCoordinates[2],
        entityManager
      );

      record = new StarSystem(
        systemAddress,
        starSystem,
        systemCoordinatesRecord.id as number,
        new Date(timestamp)
      );
      await repo.save(record);
    }

    return record;
  }

  public async findOrCreateSystemCoordinates(
    x: number,
    y: number,
    z: number,
    entityManager?: EntityManager
  ): Promise<SystemCoordinates> {
    if (!entityManager) entityManager = this.getEntityManager();
    const repo: Repository<SystemCoordinates> = entityManager.getRepository(SystemCoordinates);

    let record: SystemCoordinates | null = await repo.findOne({ where: { x, y, z } });
    if (!record) {
      record = new SystemCoordinates(x, y, z);
      await repo.save(record);
    }

    return record;
  }
}
