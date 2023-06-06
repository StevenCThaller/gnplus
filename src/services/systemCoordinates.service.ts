import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { SystemCoordinates } from "@models/index";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class SystemCoordinatesService extends DatabaseService<SystemCoordinates> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, SystemCoordinates);
  }

  public async findOrCreate(
    systemCoordinates: SystemCoordinatesParams
  ): Promise<SystemCoordinates> {
    return await this.findOrCreateEntity(SystemCoordinates, systemCoordinates);
  }
}
