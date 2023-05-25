import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import Atmosphere from "./atmosphere.model";
import AtmosphereType from "./atmosphereType.model";
import AtmosphereComposition from "./atmosphereComposition.model";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planet_atmospheres")
export default class PlanetAtmosphere extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({
    name: "body_id",
    type: "tinyint",
    unsigned: true
  })
  public bodyId?: number;
  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;

  @Column({ name: "atmosphere_type_id", nullable: true, default: null })
  public atmosphereTypeId?: number;
  @ManyToOne(
    () => AtmosphereType,
    (atmosphereType) => atmosphereType.planetAtmospheres,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "atmosphere_type_id"
  })
  public atmosphereType?: AtmosphereType;

  @Column({ name: "atmosphere_id", nullable: true, default: null })
  public atmosphereId?: number;
  @ManyToOne(() => Atmosphere, (atmosphere) => atmosphere.planetAtmospheres, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({
    name: "atmosphere_id"
  })
  public atmosphere?: Atmosphere;

  @OneToOne(
    () => PlanetaryBody,
    (planetaryBody) => planetaryBody.planetAtmosphere,
    {
      createForeignKeyConstraints: false
    }
  )
  @JoinColumn({ name: "body_id", referencedColumnName: "bodyId" })
  @JoinColumn({ name: "system_address", referencedColumnName: "systemAddress" })
  public planet?: PlanetaryBody;

  @OneToMany(
    () => AtmosphereComposition,
    (atmosphereComposition) => atmosphereComposition.planetAtmosphere,
    { cascade: ["insert"] }
  )
  public atmosphereComposition?: AtmosphereComposition[];
}
