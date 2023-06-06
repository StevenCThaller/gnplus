import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { ServiceOffered } from "@models/index";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class ServiceOfferedService extends DatabaseService<ServiceOffered> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, ServiceOffered);
  }

  public async findOrCreate(service: string): Promise<ServiceOffered> {
    try {
      return this.findOrCreateEntity(ServiceOffered, { service }, { service });
    } catch (error) {
      this.logger.error("Error thrown while running ServiceOfferedService.findOrCreate: %o", error);
      throw error;
    }
  }
}
