import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import BeltCluster from "@models/beltCluster.model";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class BeltClusterService extends DatabaseService<BeltCluster> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, BeltCluster);
    this.repository = this.dataSource.getRepository(BeltCluster);
  }

  public async findOrCreate(
    params: BeltClusterParams,
    manager?: EntityManager
  ): Promise<BeltCluster> {
    let repo = this.repository;
    if (manager) {
      repo = manager.getRepository(BeltCluster);
    }
    try {
      const { beltId, clusterId, systemAddress } = params;
      let beltCluster: BeltCluster | null = await repo.findOne({
        where: { clusterId, systemAddress }
      });

      if (!beltCluster) {
        beltCluster = repo.create({
          beltId,
          clusterId,
          systemAddress
        });
      }

      await repo.save(beltCluster);
      return beltCluster;
    } catch (error) {
      this.logger.error("Error thrown while running BeltClusterService.findOrCreate: %o", error);
      throw error;
    }
  }
}
