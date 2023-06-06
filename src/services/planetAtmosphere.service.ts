import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import PlanetAtmosphere from "@models/planetAtmosphere.model";
import { DataSource, EntityManager } from "typeorm";
import Atmosphere from "@models/atmosphere.model";
import AtmosphereType from "@models/atmosphereType.model";
import AtmosphereComposition from "@models/atmosphereComposition.model";

@Service()
export default class PlanetAtmosphereService extends DatabaseService<PlanetAtmosphere> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, PlanetAtmosphere);
    this.repository = dataSource.getRepository(PlanetAtmosphere);
  }

  public async findOrCreate(
    params: PlanetAtmosphereParams,
    manager?: EntityManager
  ): Promise<PlanetAtmosphere> {
    let repo = this.repository;
    if (manager) {
      repo = manager.getRepository(PlanetAtmosphere);
      this.repository = manager.getRepository(PlanetAtmosphere);
    }
    try {
      const { bodyId, systemAddress } = params;
      let record: PlanetAtmosphere | null = await repo.findOne({
        where: { bodyId, systemAddress }
      });

      if (record === null) {
        record = repo.create({ bodyId, systemAddress }) as PlanetAtmosphere;
      }

      await Promise.all([
        this.upsertAtmosphere(record, params.atmosphere),
        this.upsertAtmosphereType(record, params.atmosphereType)
      ]);
      await repo.save(record);

      await this.upsertAtmosphereComposition(record, params.atmosphereComposition);

      return record;
    } catch (error) {
      this.logger.error(
        "Error thrown while running PlanetAtmosphereService.findOrCreate: %o",
        error
      );
      throw error;
    }
  }

  private async upsertAtmosphere(record: PlanetAtmosphere, atmosphere?: string): Promise<void> {
    if (atmosphere) {
      record.atmosphere = await this.findOrCreateEntity(Atmosphere, { atmosphere });
    }
  }

  private async upsertAtmosphereType(
    record: PlanetAtmosphere,
    atmosphereType?: string
  ): Promise<void> {
    if (atmosphereType) {
      record.atmosphereType = await this.findOrCreateEntity(AtmosphereType, { atmosphereType });
    }
  }

  private async upsertAtmosphereComposition(
    record: PlanetAtmosphere,
    atmosphereComposition?: AtmosphereCompositionParams[]
  ): Promise<void> {
    if (atmosphereComposition) {
      record.atmosphereComposition = await Promise.all(
        atmosphereComposition.map(
          async (comp: AtmosphereCompositionParams): Promise<AtmosphereComposition> => {
            const atmosphereType = await this.findOrCreateEntity(AtmosphereType, {
              atmosphereType: comp.atmosphereType
            });

            return this.findOrCreateEntity(
              AtmosphereComposition,
              {
                planetAtmosphereId: record.id,
                atmosphereTypeId: atmosphereType.id
              },
              {
                planetAtmosphereId: record.id,
                atmosphereTypeId: atmosphereType.id,
                percent: comp.percent
              }
            );
          }
        )
      );
    }
  }
}
