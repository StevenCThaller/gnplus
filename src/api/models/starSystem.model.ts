import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  BaseEntity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany
} from "typeorm";
import SystemCoordinates from "./systemCoordinates.model";
import Station from "./station.model";
import Allegiance from "./allegiance.model";
import SecurityLevel from "./securityLevel.model";
import SystemEconomy from "./systemEconomy.model";
import PrimarySystemFaction from "./primarySystemFaction.model";
import SystemFaction from "./systemFaction.model";
import PowerplayState from "./powerplayState.model";
import Power from "./power.model";
import ThargoidWar from "./thargoidWar.model";
import SystemConflict from "./systemConflict.model";
import Government from "./government.model";

@Entity("star_systems")
export default class StarSystem extends BaseEntity {
  @PrimaryColumn({
    name: "system_address",
    nullable: false,
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;

  @Column({ name: "system_name", unique: true, nullable: false })
  public systemName?: string;

  @Column({
    name: "population",
    nullable: true,
    type: "bigint",
    unsigned: true
  })
  public population?: number;

  /**
   * One to One with System Coordinates
   */
  @Column({ name: "system_coordinates_id", nullable: true })
  public systemCoordinatesId?: number;
  @OneToOne(
    () => SystemCoordinates,
    (systemCoordinates) => systemCoordinates.system,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "system_coordinates_id" })
  public systemCoordinates?: SystemCoordinates;

  /**
   * Many to One with Government
   */
  @Column({ name: "government_id", nullable: true })
  public governmentId?: number;
  @ManyToOne(() => Government, (government) => government.systems)
  @JoinColumn({ name: "government_id" })
  public government?: Government;

  /**
   * Many to One with Allegiance
   */
  @Column({ name: "allegiance_id", nullable: true })
  public allegianceId?: number;
  @ManyToOne(() => Allegiance, (allegiance) => allegiance.systems)
  @JoinColumn({ name: "allegiance_id" })
  public allegiance?: Allegiance;

  /**
   * Many to One with System Economy
   */
  @Column({
    name: "system_economy_id",
    type: "bigint",
    unsigned: true,
    default: null,
    nullable: true
  })
  public systemEconomyId?: number;
  @ManyToOne(() => SystemEconomy, (systemEconomy) => systemEconomy.systems)
  @JoinColumn({ name: "system_economy_id" })
  public systemEconomy?: SystemEconomy;

  /**
   * One to One with Primary System Faction
   */
  @Column({
    name: "primary_faction_id",
    type: "bigint",
    unsigned: true,
    nullable: true,
    default: null
  })
  public primaryFactionId?: number;
  @OneToOne(() => PrimarySystemFaction, { cascade: ["insert"] })
  @JoinColumn({ name: "primary_faction_id" })
  public primaryFaction?: PrimarySystemFaction;

  /**
   * Many to One with Security Level
   */
  @Column({ name: "security_level_id", nullable: true, default: null })
  public securityLevelId?: number;
  @ManyToOne(() => SecurityLevel, (securityLevel) => securityLevel.systems, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "security_level_id" })
  public securityLevel?: SecurityLevel;

  /**
   * One to Many with Stations
   */
  @OneToMany(() => Station, (station) => station.starSystem)
  public stationsInSystem?: Station[];

  /**
   * One to Many with System Factions
   */
  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.system, {
    cascade: ["insert"]
  })
  public systemFactions?: SystemFaction[];

  /**
   * Many to One with Powerplay State
   */
  @Column({ name: "powerplay_state_id", nullable: true, default: null })
  public powerplayStateId?: number;
  @ManyToOne(() => PowerplayState, (powerplayState) => powerplayState.systems, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "powerplay_state_id" })
  public powerplayState?: PowerplayState;

  /**
   * Many to Many with Powers
   */
  @ManyToMany(() => Power, (power) => power.systems, { cascade: ["insert"] })
  @JoinTable({
    name: "system_powers",
    joinColumn: {
      name: "system_address",
      referencedColumnName: "systemAddress"
    },
    inverseJoinColumn: { name: "power_id", referencedColumnName: "id" }
  })
  public systemPowers?: Power[];

  /**
   * One to One with Thargoid Wars
   */
  @OneToOne(() => ThargoidWar, (thargoidWar) => thargoidWar.system)
  public thargoidWar?: ThargoidWar;

  /**
   * One to Many with System Conflicts
   */
  @OneToMany(() => SystemConflict, (systemConflict) => systemConflict.system, {
    cascade: ["insert", "update"]
  })
  public systemConflicts?: SystemConflict[];

  /**
   * Timestamps
   */
  @Column({
    name: "created_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP"
  })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;
}
