import { Inject, Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default abstract class TypeORMService {
  protected manager?: EntityManager;
  @Inject("logger")
  protected logger!: Logger;
  constructor(protected dataSource: DataSource) {}

  public async createTransaction<T>(
    data: T,
    transactionHandler: (data: T) => Promise<any>
  ): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager) => {
      this.manager = transaction;
      await transactionHandler(data);
    });
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
