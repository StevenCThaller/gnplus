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
import SystemCoordinates from "./systemCoordinates";
import Station from "./station";
import Allegiance from "./allegiance";
import SecurityLevel from "./securityLevel";
import SystemEconomy from "./systemEconomy";
import PrimarySystemFaction from "./primarySystemFaction";
import SystemFaction from "./systemFaction";
import PowerplayState from "./powerplayState";
import Power from "./power";
import ThargoidWar from "./thargoidWar";
import SystemConflict from "./systemConflict";

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

  @Column({ name: "population", nullable: true, unsigned: true })
  public population?: number;

  /**
   * One to One with System Coordinates
   */
  @Column({ name: "system_coordinates_id", nullable: true })
  public systemCoordinatesId!: number;
  @OneToOne(
    () => SystemCoordinates,
    (systemCoordinates) => systemCoordinates.system,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "system_coordinates_id" })
  public systemCoordinates!: SystemCoordinates;

  /**
   * Many to One with Allegiance
   */
  @Column({ name: "allegiance_id", nullable: true })
  public allegianceId?: number;
  @ManyToOne(() => Allegiance, (allegiance) => allegiance.systems)
  @JoinColumn({ name: "allegiance_id" })
  public allegiance!: Allegiance;

  /**
   * One to One with System Economy
   */
  @Column({
    name: "system_economy",
    type: "bigint",
    unique: true,
    unsigned: true
  })
  public systemEconomyId!: number;
  @OneToOne(() => SystemEconomy, (systemEconomy) => systemEconomy.system)
  @JoinColumn({ name: "system_economy_id" })
  public systemEconomy!: SystemEconomy;

  /**
   * One to One with Primary System Faction
   */
  @Column({ name: "primary_faction_id" })
  public primaryFactionId!: number;
  @OneToOne(
    () => PrimarySystemFaction,
    (primarySystemFaction) => primarySystemFaction.system,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "primary_faction_id" })
  public primaryFaction!: PrimarySystemFaction;

  /**
   * Many to One with Security Level
   */
  @Column({ name: "security_level_id" })
  public securityLevelId!: number;
  @ManyToOne(() => SecurityLevel, (securityLevel) => securityLevel.systems)
  @JoinColumn({ name: "security_level_id" })
  public securityLevel!: SecurityLevel;

  /**
   * One to Many with Stations
   */
  @OneToMany((type) => Station, (station) => station.starSystem)
  public stationsInSystem!: Station[];

  /**
   * One to Many with System Factions
   */
  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.system)
  public systemFactions!: SystemFaction[];

  /**
   * Many to One with Powerplay State
   */
  @Column({ name: "powerplay_state_id" })
  public powerplayStateId!: number;
  @ManyToOne(() => PowerplayState, (powerplayState) => powerplayState.systems, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "powerplay_state_id" })
  public powerplayState!: PowerplayState;

  /**
   * Many to Many with Powers
   */
  @ManyToMany(() => Power, (power) => power.systems)
  @JoinTable({
    name: "system_powers",
    joinColumn: {
      name: "system_address",
      referencedColumnName: "system_address"
    },
    inverseJoinColumn: { name: "power_id", referencedColumnName: "id" }
  })
  public systemPowers!: Power[];

  /**
   * One to One with Thargoid Wars
   */
  @OneToOne(() => ThargoidWar, (thargoidWar) => thargoidWar.system)
  public thargoidWar!: ThargoidWar;

  /**
   * One to Many with System Conflicts
   */
  @OneToMany(() => SystemConflict, (systemConflict) => systemConflict.system)
  public systemConflicts!: SystemConflict[];

  /**
   * Timestamps
   */
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
}
