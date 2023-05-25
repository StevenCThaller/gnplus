import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import Atmosphere from "./atmosphere.model";
import AtmosphereType from "./atmosphereType.model";
import AtmosphereComposition from "./atmosphereComposition.model";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planet_atmospheres")
// @Index("planet_atmosphere_id", ["bodyId", "systemAddress"], {
//   unique: true
// })
export default class PlanetAtmosphere extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "atmosphere_type_id" })
  public atmosphereTypeId?: number;
  @ManyToOne(
    () => AtmosphereType,
    (atmosphereType) => atmosphereType.planetAtmospheres,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "atmosphere_type_id"
    // foreignKeyConstraintName: "planet_atmosphere_type_fk"
  })
  public atmosphereType?: AtmosphereType;

  @Column({ name: "atmosphere_id" })
  public atmosphereId?: number;
  @ManyToOne(() => Atmosphere, (atmosphere) => atmosphere.planetAtmospheres, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({
    name: "atmosphere_id"
    // foreignKeyConstraintName: "atmosphere_on_planet"
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
