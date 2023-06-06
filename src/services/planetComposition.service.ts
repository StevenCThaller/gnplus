import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import PlanetComposition from "@models/planetComposition.model";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class PlanetCompositionService extends DatabaseService<PlanetComposition> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, PlanetComposition);
    this.repository = dataSource.getRepository(PlanetComposition);
  }

  public async findOrCreate(params: PlanetCompositionParams): Promise<PlanetComposition> {
    try {
      let record: PlanetComposition | null = await this.repository.findOne({ where: params });

      if (!record) {
        record = this.repository.create(params);
      }

      await this.repository.save(record);
      return record;
    } catch (error) {
      this.logger.error(
        "Error thrown while running PlanetCompositionService.findOrCreate: %o",
        error
      );
      throw error;
    }
  }

  public override setDataSource(source: DataSource | EntityManager): PlanetCompositionService {
    super.setDataSource(source);
    return this;
  }
}
