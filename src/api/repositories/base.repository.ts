import { AppDataSource } from "@datasource";
import LoggerInstance from "@loaders/logger";
import { Service, Inject } from "typedi";
import {
  BaseEntity,
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository
} from "typeorm";
import { Logger } from "winston";

export type RepoManager = DataSource | EntityManager;

export default abstract class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;
  protected logger: Logger;

  protected constructor(model: EntityTarget<T>, dataSource: RepoManager) {
    this.repository = dataSource.getRepository(model);
    this.logger = LoggerInstance;
  }

  protected async _findOneOrCreate(
    findParams: any,
    createParams?: any
  ): Promise<T> {
    try {
      if (!createParams) createParams = findParams;

      return (
        (await this.repository.findOne({ where: findParams })) ||
        this.repository.create(createParams as DeepPartial<T>)
      );
    } catch (error) {
      this.logger.error(
        "An error occured when running findOneOrCreate for the following find and create params:"
      );
      this.logger.error("FIND: %o", findParams);
      this.logger.error("CREATE: %o", createParams);
      this.logger.error("Error in question: %o", error);
      throw error;
    }
  }

  public async save(entity: T): Promise<void> {
    try {
      if ((entity as any).id) await entity.save();
      else await this.repository.save(entity);
    } catch (error) {
      this.logger.error(
        "An error occurred when attempting to save the following entity: %o",
        entity
      );
      this.logger.error("Error in question: %o", error);
      throw error;
    }
  }
}
