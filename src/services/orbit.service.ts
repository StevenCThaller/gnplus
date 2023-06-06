import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Orbit } from "@models/index";

@Service()
export default class OrbitService extends DatabaseService<Orbit> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, Orbit);
    this.repository = this.dataSource.getRepository(Orbit);
  }

  public async findOrCreate(
    params: OrbitParams,
    manager?: EntityManager | DataSource
  ): Promise<Orbit> {
    let repo: Repository<Orbit> = this.repository;
    if (manager) {
      repo = manager.getRepository(Orbit);
    }
    try {
      const { bodyId, systemAddress } = params;
      let orbitRecord: Orbit | null = await repo.findOne({
        where: { bodyId, systemAddress }
      });

      if (!orbitRecord) {
        orbitRecord = repo.create(params);
      }

      await repo.save(orbitRecord);
      return orbitRecord;
    } catch (error) {
      this.logger.error("Error thrown while running OrbitService.findOrCreate: %o", error);
      throw error;
    }
  }
}
