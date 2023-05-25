import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planet_compositions")
@Index("planet_composition_id", ["bodyId", "systemAddress"])
export default class PlanetComposition extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: "float", nullable: false })
  public ice?: number;
  @Column({ type: "float", nullable: false })
  public rock?: number;
  @Column({ type: "float", nullable: false })
  public metal?: number;

  @Column({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;
  @OneToOne(
    () => PlanetaryBody,
    (planetaryBody) => planetaryBody.planetComposition,
    { createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "planetary_body_id"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "planetary_body_id"
  })
  public planet?: PlanetaryBody;
}
