import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Barycenter } from "@models/index";

@Service()
export default class BarycenterService extends DatabaseService<Barycenter> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, Barycenter);
    this.repository = this.dataSource.getRepository(Barycenter);
  }

  public async findOrCreate(
    params: BarycenterParams,
    manager?: EntityManager | DataSource
  ): Promise<Barycenter> {
    let repo: Repository<Barycenter> = this.repository;
    if (manager) {
      repo = manager.getRepository(Barycenter);
    }
    try {
      const {
        bodyId,
        system: { systemAddress },
        ascendingNode,
        meanAnomaly
      } = params;
      let barycenterRecord: Barycenter | null = await repo.findOne({
        where: { bodyId, systemAddress }
      });

      if (!barycenterRecord) {
        barycenterRecord = repo.create({
          bodyId,
          systemAddress,
          ascendingNode,
          meanAnomaly
        });
      }

      await repo.save(barycenterRecord);
      return barycenterRecord;
    } catch (error) {
      this.logger.error("Error thrown while running BarcenterService.findOrCreate: %o", error);
      throw error;
    }
  }
}
