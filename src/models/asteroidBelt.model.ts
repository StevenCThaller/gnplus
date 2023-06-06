import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import Ring from "./ring.model";
import BeltCluster from "./beltCluster.model";
import StellarBody from "./stellarBody.model";

@Entity("asteroid_belts")
// @Index("asteroid_belt_id", ["bodyId", "systemAddress"], { unique: true })
export default class AsteroidBelt extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ name: "ring_id", type: "bigint", unsigned: true, nullable: true })
  public ringId?: number;
  @OneToOne(() => Ring, {
    createForeignKeyConstraints: false,
    cascade: ["insert"]
  })
  @JoinColumn({ name: "ring_id" })
  public ring?: Ring;

  @OneToMany(() => BeltCluster, (beltCluster) => beltCluster.belt)
  public beltClusters?: BeltCluster[];

  @Column({ name: "belt_name", nullable: true, unique: true })
  public beltName?: string;

  @Column({
    name: "belt_id",
    type: "tinyint",
    unsigned: true,
    nullable: true
  })
  public beltId?: number;
  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;

  @Column({ name: "star_id", type: "smallint", unsigned: true })
  public starId?: number;
  @ManyToOne(() => StellarBody, (stellarBody) => stellarBody.asteroidBelts, {
    createForeignKeyConstraints: false
  })
  @JoinColumn([
    { name: "star_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public star?: StellarBody;

  // @OneToOne(() => CelestialBody)
  // @JoinColumn({ name: "body_id", referencedColumnName: "bodyId" })
  // @JoinColumn({ name: "system_address", referencedColumnName: "systemAddress" })
  // public asteroidBelt?: CelestialBody;
}
