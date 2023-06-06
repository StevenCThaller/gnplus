import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import SurfaceMaterial from "@models/surfaceMaterial.model";
import { DataSource, EntityManager } from "typeorm";
import { EntityListenerMetadata } from "typeorm/metadata/EntityListenerMetadata";
import Material from "@models/material.model";

@Service()
export default class SurfaceMaterialService extends DatabaseService<SurfaceMaterial> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, SurfaceMaterial);
    this.repository = this.dataSource.getRepository(SurfaceMaterial);
  }

  public async findOrCreate(
    params: SurfaceMaterialParams | SurfaceMaterialParams[],
    manager?: EntityManager
  ): Promise<SurfaceMaterial | SurfaceMaterial[]> {
    if (manager) {
      this.dataSource = manager;
      this.repository = manager.getRepository(SurfaceMaterial);
    }
    try {
      if (Array.isArray(params)) {
        return Promise.all(
          params.map(
            (params: SurfaceMaterialParams): Promise<SurfaceMaterial> =>
              this.findOrCreate(
                params as SurfaceMaterialParams,
                manager
              ) as Promise<SurfaceMaterial>
          )
        );
      }

      const material: Material = await this.findOrCreateEntity(Material, {
        material: params.material
      });
      const { bodyId, systemAddress } = params;
      let record: SurfaceMaterial | null = await this.repository.findOne({
        where: { bodyId, systemAddress, materialId: material.id }
      });

      if (!record) {
        record = this.repository.create({
          bodyId,
          systemAddress,
          material,
          percent: params.percent
        });
        await this.repository.save(record);
      }

      return record;
    } catch (error) {
      this.logger.error(
        "Error thrown while running SurfaceMaterialService.findOrCreate: %o",
        error
      );
      throw error;
    }
  }
}
