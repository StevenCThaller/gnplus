import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
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
import CelestialBody from "./celestialBody.model";

@Entity("star_systems")
export default class StarSystem {
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
  @ManyToOne(() => SystemCoordinates, (systemCoordinates) => systemCoordinates.system, {
    nullable: true
  })
  @JoinColumn({ name: "system_coordinates_id" })
  public systemCoordinates?: SystemCoordinates;

  /**
   * Many to One with Government
   */
  @Column({ name: "government_id", type: "tinyint", unsigned: true, nullable: true })
  public governmentId?: number;
  @ManyToOne(() => Government, (government) => government.systems)
  @JoinColumn({ name: "government_id" })
  public government?: Government;

  /**
   * Many to One with Allegiance
   */
  @Column({ name: "allegiance_id", type: "tinyint", unsigned: true, nullable: true })
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
  @OneToOne(() => PrimarySystemFaction, { cascade: false, createForeignKeyConstraints: false })
  @JoinColumn({ name: "system_address" })
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
  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.system)
  public systemFactions?: SystemFaction[];

  /**
   * Many to One with Powerplay State
   */
  @Column({
    name: "powerplay_state_id",
    type: "tinyint",
    unsigned: true,
    nullable: true,
    default: null
  })
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
   * One to Many with Bodies
   */
  @OneToMany(() => CelestialBody, (body) => body.system, {
    cascade: ["insert"]
  })
  public bodies?: CelestialBody[];

  /**
   * Timestamps
   */
  @Column({
    name: "created_at",
    nullable: false
  })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    nullable: false,
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;

  public static convertDocked(data: DockedData): StarSystemParams {
    return this.getBasic(data);
  }

  public static convertScanBarycenter(data: ScanBarycentreData): StarSystemParams {
    return this.getBasic(data);
  }

  public static convertScan(data: ScanData): StarSystemParams {
    return this.getBasic(data);
  }

  public static convertFSDJump(data: FSDJumpData): StarSystemParams {
    return {
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      systemCoordinates: SystemCoordinates.convertFSDJump(data),
      systemEconomy: SystemEconomy.convertFSDJump(data),
      population: data.Population,
      allegiance: data.SystemAllegiance,
      government: data.SystemGovernment,
      primarySystemFaction: PrimarySystemFaction.convertFSDJump(data),
      securityLevel: data.SystemSecurity,
      systemFactions: SystemFaction.convertFSDJump(data),
      powerplayState: data.PowerplayState,
      systemPowers: data.Powers,
      systemConflicts: SystemConflict.convertFSDJump(data),
      // thargoidWar: data.ThargoidWar ? ThargoidWar.convertFSDJump(data) : undefined,
      timestamp: new Date(data.timestamp)
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getBasic(data: any): StarSystemParams {
    return {
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      systemCoordinates: { x: data.StarPos[0], y: data.StarPos[1], z: data.StarPos[2] },
      timestamp: new Date(data.timestamp)
    };
  }

  constructor(
    systemAddress: number,
    starSystem: string,
    systemCoordinatesId: number | undefined,
    timestamp?: Date,
    population?: number
  ) {
    this.systemAddress = systemAddress;
    this.systemName = starSystem;
    this.systemCoordinatesId = systemCoordinatesId;
    if (population != null) this.population = population;
    if (timestamp) {
      this.createdAt = timestamp;
      this.updatedAt = timestamp;
    }
  }
}
