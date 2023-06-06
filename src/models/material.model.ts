import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import SurfaceMaterial from "./surfaceMaterial.model";

@Entity("materials")
export default class Material extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true, nullable: false })
  public material?: string;

  @OneToMany(
    () => SurfaceMaterial,
    (surfaceMaterial) => surfaceMaterial.material
  )
  public surfaceMaterials?: SurfaceMaterial[];
}
