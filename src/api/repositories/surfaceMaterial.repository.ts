import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { Material, SurfaceMaterial } from "@api/models";

type SurfaceMaterialParams = {
  bodyId: number;
  systemAddress: number;
  materialId?: number;
  material?: Material;
  percent: number;
};

@Service()
export default class SurfaceMaterialRepository extends BaseRepository<SurfaceMaterial> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SurfaceMaterial, dataSource);
  }

  public async findOneOrCreate(
    params: SurfaceMaterialParams
  ): Promise<SurfaceMaterial> {
    if (!params.material && !params.materialId)
      throw "Material data required. Please provide either materialId or a Material record.";
    const { bodyId, systemAddress } = params;
    const record: SurfaceMaterial | null = await this.repository.findOne({
      where: {
        bodyId,
        systemAddress,
        materialId: params.materialId || params.material?.id
      }
    });

    if (record) {
      if (record.percent === params.percent) return record;
      else record.percent = params.percent;
      await this.repository.save(record);
      return record;
    }

    return this.repository.create(params);
  }
}
