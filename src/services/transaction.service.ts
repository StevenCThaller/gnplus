import { AppDataSource } from "@datasource";
import LoggerInstance from "@loaders/logger";
import { Service } from "typedi";
import { EntityManager, EntityTarget } from "typeorm";
import { Logger } from "winston";

@Service()
export default class TransactionService {
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
}
