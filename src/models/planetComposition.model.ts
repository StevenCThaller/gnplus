import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planet_compositions")
@Index("planet_composition_id", ["ice", "rock", "metal"])
export default class PlanetComposition extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ type: "float", nullable: false })
  public ice?: number;
  @Column({ type: "float", nullable: false })
  public rock?: number;
  @Column({ type: "float", nullable: false })
  public metal?: number;

  @OneToMany(() => PlanetaryBody, (planetaryBody) => planetaryBody.planetComposition, {
    createForeignKeyConstraints: false
  })
  public planets?: PlanetaryBody;

  public static convertScan(data: PlanetScanData): PlanetCompositionParams | undefined {
    if (!data.Composition) return;
    return {
      ice: data.Composition.Ice,
      rock: data.Composition.Rock,
      metal: data.Composition.Metal
    };
  }
}
