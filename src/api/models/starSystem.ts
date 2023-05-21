import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  BaseEntity,
  JoinColumn,
  ManyToOne
} from "typeorm";
import SystemCoordinates from "./systemCoordinates";
import Station from "./station";
import Allegiance from "./allegiance";
import SecurityLevel from "./securityLevel";

@Entity("star_systems")
export default class StarSystem extends BaseEntity {
  @PrimaryColumn({
    name: "system_address",
    nullable: false,
    unique: true,
    type: "bigint",
    unsigned: true
  })
  public systemAddress!: number;

  @Column({ name: "system_name", unique: true, nullable: false })
  public systemName!: string;

  @Column({ name: "system_coordinates_id", nullable: true })
  public systemCoordinatesId!: number;

  @Column({ name: "population", nullable: true, unsigned: true })
  public population?: number;

  @Column({ name: "allegiance_id", nullable: true })
  public allegianceId?: number;

  @Column({ name: "security_level_id", nullable: true })
  public securityLevelId?: number;
  @Column({
    name: "created_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP"
  })
  public createdAt!: Date;

  @Column({
    name: "updated_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt!: Date;

  @ManyToOne(() => SecurityLevel, (securityLevel) => securityLevel.systems)
  @JoinColumn({ name: "security_level_id" })
  public securityLevel!: SecurityLevel;

  @ManyToOne(() => Allegiance, (allegiance) => allegiance.systems)
  @JoinColumn({ name: "allegiance_id" })
  public allegiance!: Allegiance;

  @OneToOne(
    () => SystemCoordinates,
    (systemCoordinates) => systemCoordinates.systemAtCoordinates,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "system_coordinates_id", referencedColumnName: "id" })
  public systemCoordinates!: SystemCoordinates;

  @OneToMany((type) => Station, (station) => station.starSystem)
  public stationsInSystem!: Station[];
}
