import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { AsteroidBelt, Ring, RingClass } from "@models/index";

@Service()
export default class AsteroidBeltService extends DatabaseService<AsteroidBelt> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, AsteroidBelt);
    this.repository = this.dataSource.getRepository(AsteroidBelt);
  }

  public async findOrCreate(
    params: AsteroidBeltParams,
    manager?: EntityManager | DataSource
  ): Promise<AsteroidBelt> {
    let repo: Repository<AsteroidBelt> = this.repository;
    if (manager) {
      repo = manager.getRepository(AsteroidBelt);
    }
    try {
      const { starId, systemAddress } = params;
      let asteroidBeltRecord: AsteroidBelt | null = await repo.findOne({
        where: { beltName: params.ring.ringName }
      });

      if (!asteroidBeltRecord) {
        asteroidBeltRecord = repo.create({
          starId,
          systemAddress,
          beltName: params.ring.ringName
        });
      }
      await this.upsertRing(asteroidBeltRecord, params.ring);

      await repo.save(asteroidBeltRecord);
      return asteroidBeltRecord;
    } catch (error) {
      this.logger.error("Error thrown while running AsteroidBeltService.findOrCreate: %o", error);
      throw error;
    }
  }

  public async updateBeltIdByName(
    name: string,
    beltId: number,
    manager?: EntityManager
  ): Promise<void> {
    let repo: Repository<AsteroidBelt> = this.repository;
    if (manager) {
      repo = manager.getRepository(AsteroidBelt);
    }
    try {
      const beltRecord: AsteroidBelt | null = await repo.findOne({ where: { beltName: name } });
      if (beltRecord) {
        beltRecord.beltId = beltId;
        await repo.save(beltRecord);
      }
    } catch (error) {
      this.logger.error(
        "Error thrown while running AsteroidBeltService.updateBeltIdByName: %o",
        error
      );
      throw error;
    }
  }

  private async upsertRing(beltRecord: AsteroidBelt, ring?: RingParams): Promise<void> {
    if (ring) {
      const ringClass = await this.findOrCreateEntity(RingClass, { className: ring.ringClass });
      beltRecord.ring = await this.findOrCreateEntity(
        Ring,
        { ringName: ring.ringName },
        {
          bodyId: ring.bodyId,
          systemAddress: ring.systemAddress,
          ringName: ring.ringName,
          innerRadius: ring.innerRadius,
          outerRadius: ring.outerRadius,
          massMegatons: ring.massMegatons,
          ringClass
        }
      );
    }
  }
}
