import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import PlanetaryBody from "./planetaryBody.model";
import Material from "./material.model";

@Entity("surface_materials")
export default class SurfaceMaterial extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @PrimaryColumn({ name: "material_id" })
  public materialId?: number;
  @Column({ name: "percent", type: "float" })
  public percent?: number;

  @ManyToOne(() => Material, (material) => material.surfaceMaterials, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "material_id" })
  public material?: Material;

  @ManyToOne(() => PlanetaryBody, (planetaryBody) => planetaryBody.surfaceMaterials)
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public planet?: PlanetaryBody;

  public static convertScan(data: PlanetScanData): SurfaceMaterialParams[] | undefined {
    if (!data.Materials) return;

    return data.Materials.map(
      (surfaceMaterial: MaterialData): SurfaceMaterialParams => ({
        bodyId: data.BodyID,
        systemAddress: data.SystemAddress,
        material: surfaceMaterial.Name,
        percent: surfaceMaterial.Percent
      })
    );
  }
}
