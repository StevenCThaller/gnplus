import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetaryBody from "./planetaryBody.model";
import Material from "./material.model";

@Entity("surface_materials")
export default class SurfaceMaterial extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "material_id" })
  public materialId?: number;
  @Column({ name: "percent", type: "float" })
  public percent?: number;

  @ManyToOne(() => Material, (material) => material.surfaceMaterials)
  @JoinColumn({ name: "material_id" })
  public material?: Material;

  @ManyToOne(
    () => PlanetaryBody,
    (planetaryBody) => planetaryBody.surfaceMaterials
  )
  // @JoinColumn({
  //   name: "body_id",
  //   referencedColumnName: "bodyId"
  //   // foreignKeyConstraintName: "planet_id"
  // })
  // @JoinColumn({
  //   name: "system_address",
  //   referencedColumnName: "systemAddress"
  //   // foreignKeyConstraintName: "planet_id"
  // })
  public planet?: PlanetaryBody;
}
