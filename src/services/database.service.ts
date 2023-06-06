import LoggerInstance from "@loaders/logger";
import { Service } from "typedi";
import {
  BaseEntity,
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository
} from "typeorm";
import fs from "fs";
import path from "path";
import { Logger } from "winston";

type PrimaryKeyParams<T> = Partial<{ [K in keyof T]: T[K] }>;

@Service()
export default abstract class DatabaseService<T extends BaseEntity> {
  protected repository: Repository<T>;
  protected logger: Logger = LoggerInstance;
  protected readonly model: EntityTarget<T>;
  constructor(protected dataSource: DataSource | EntityManager, model: EntityTarget<T>) {
    this.model = model;
    this.repository = dataSource.getRepository(model);
    // this.logger.info("DataSource: %o", this.dataSource);
  }

  public async createTransaction<K>(
    data: K,
    transactionHandler: (data: K) => Promise<unknown>
  ): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager) => {
      try {
        this.dataSource = transaction;
        await transactionHandler(data);
      } catch (error) {
        this.logger.error(
          "Error thrown while running DatabaseService.createTransaction: %o",
          error
        );

        throw error;
      }
    });
  }

  public async findAll(): Promise<T[]> {
    return this.dataSource.getRepository<T>(this.model).find();
  }

  protected async findByPK(primaryKey: PrimaryKeyParams<T>): Promise<T | null> {
    try {
      return this.repository.findOne({
        where: primaryKey as FindOptionsWhere<T>
      });
    } catch (error) {
      this.logger.error("Error thrown while running DatabaseService.findByPK: %o", error);
      throw error;
    }
  }

  protected async deleteEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    deleteOptions: FindOptionsWhere<T>
  ): Promise<DeleteResult> {
    const repo: Repository<T> = this.dataSource.getRepository<T>(entityClass);
    return repo.delete(deleteOptions);
  }

  protected async findOneEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    findOptions: FindOneOptions<T>
  ): Promise<T | null> {
    const repository: Repository<T> = this.dataSource.getRepository(entityClass);

    return await repository.findOne(findOptions);
  }

  protected async findOrCreateEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
    save?: boolean
  ): Promise<T>;
  protected async findOrCreateEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
    createOptions: DeepPartial<T>
  ): Promise<T>;
  protected async findOrCreateEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
    createOptions: DeepPartial<T>,
    save: boolean
  ): Promise<T>;
  protected async findOrCreateEntity<T extends BaseEntity>(
    entityClass: EntityTarget<T>,
    findOptions: FindOptionsWhere<T> | DeepPartial<T>,
    createOptions?: DeepPartial<T> | boolean,
    save?: boolean
  ): Promise<T> {
    const repo: Repository<T> = this.dataSource.getRepository<T>(entityClass);
    if (typeof createOptions === "boolean") {
      save = createOptions;
      findOptions = findOptions as FindOptionsWhere<T>;
      createOptions = findOptions as DeepPartial<T>;
    } else if (createOptions == null) {
      findOptions = findOptions as FindOptionsWhere<T>;
      createOptions = findOptions as DeepPartial<T>;
      save = true;
    } else if (typeof save !== "boolean" || save == null) {
      findOptions = findOptions as FindOptionsWhere<T>;
      save = true;
    } else findOptions = findOptions as FindOptionsWhere<T>;

    const existingEntity: T | null = await repo.findOne({ where: findOptions });
    if (existingEntity) {
      return existingEntity;
    } else {
      const newEntity = repo.create(createOptions);
      if (save) {
        await repo.save(newEntity);
      }
      return newEntity;
    }
  }

  protected getService<M extends BaseEntity, S extends DatabaseService<M>>(
    serviceClass: Newable<S>
  ): S {
    const service = new serviceClass(this.dataSource);
    service.setDataSource(this.dataSource);
    return service;
  }

  public setDataSource<M extends DatabaseService<T>>(source: DataSource | EntityManager): any {
    this.dataSource = source;
    this.repository = this.dataSource.getRepository(this.model);
    return this;
  }

  protected async seed(fileName: string): Promise<void> {
    const count = await this.repository.count();
    if (count > 0) return;

    fs.readFile(
      path.join(__dirname, "..", "database", "seed", fileName),
      async (err: NodeJS.ErrnoException | null, data: Buffer) => {
        if (err) this.logger.error("WHY? %o", err);

        const records = this.repository.create(JSON.parse(data.toString()));
        await this.repository.save(records);
      }
    );
  }
}
