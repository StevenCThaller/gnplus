import { Luminosity, StarType, StellarBody } from "@models/index";
import DatabaseService from "./database.service";
import { Inject, Service } from "typedi";
import { DataSource, EntityManager, Repository } from "typeorm";

@Service()
export default class StellarBodyService extends DatabaseService<StellarBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, StellarBody);
    this.repository = this.dataSource.getRepository(StellarBody);
  }

  public async findOrCreate(
    params: StellarBodyParams,
    manager?: EntityManager
  ): Promise<StellarBody> {
    let repo: Repository<StellarBody> = this.repository;
    if (manager) {
      repo = manager.getRepository(StellarBody);
    }
    try {
      const {
        bodyId,
        system: { systemAddress }
      } = params;
      let stellarBodyRecord: StellarBody | null = await repo.findOne({
        where: { bodyId, systemAddress }
      });

      if (!stellarBodyRecord) {
        stellarBodyRecord = repo.create({
          bodyId,
          systemAddress,
          absoluteMagnitude: params.absoluteMagnitude,
          ageMY: params.ageMY,
          stellarMass: params.stellarMass,
          subclass: params.stellarMass,
          surfaceTemperature: params.surfaceTemperature
        });
      }

      await Promise.all([
        this.upsertLuminosity(stellarBodyRecord, params.luminosity),
        this.upsertStarType(stellarBodyRecord, params.starType)
      ]);

      await repo.save(stellarBodyRecord);
      return stellarBodyRecord;
    } catch (error) {
      this.logger.error("Error thrown while running StellarBodyService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertLuminosity(stellarBody: StellarBody, luminosity?: string): Promise<void> {
    if (luminosity) {
      stellarBody.luminosity = await this.findOrCreateEntity(Luminosity, { luminosity });
    }
  }

  private async upsertStarType(stellarBody: StellarBody, label?: string): Promise<void> {
    if (label) {
      stellarBody.starType = await this.findOrCreateEntity(StarType, { label });
    }
  }
}
