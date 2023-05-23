import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  BaseEntity,
  JoinColumn,
  Index,
  ManyToMany,
  JoinTable
} from "typeorm";
import Allegiance from "./allegiance.model";
import FactionState from "./factionState.model";
import StarSystem from "./starSystem.model";
import Government from "./government.model";
import Faction from "./faction.model";
import PendingState from "./pendingState.model";
import RecoveringState from "./recoveringState.model";
import HappinessLevel from "./happinessLevel.model";
import ActiveState from "./activeState.model";

@Entity("system_factions")
@Index(["systemAddress", "factionId"])
export default class SystemFaction extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  /**
   * Many to One with System
   */
  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true,
    nullable: true,
    foreignKeyConstraintName: "system_address_system_faction"
  })
  public systemAddress?: number;
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.systemFactions, {
    nullable: true,
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;
  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id", nullable: false })
  public factionId?: number;
  @ManyToOne(() => Faction, (faction) => faction.systemFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  /**
   * Many to One with Allegiance
   */
  @Column({ name: "allegiance_id", nullable: false })
  public allegianceId?: number;
  @ManyToOne(() => Allegiance, (allegiance) => allegiance.systemFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "allegiance_id" })
  public allegiance?: Allegiance;

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id", nullable: false })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.systemFactions,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Many to One with Government
   */
  @Column({ name: "government_id", nullable: false })
  public governmentId?: number;
  @ManyToOne(() => Government, (government) => government.systemFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "government_id" })
  public government?: Government;

  /**
   * Many to One with HappinessLevel
   */
  @Column({ name: "happiness_level_id", nullable: false })
  public happinessLevelId?: number;
  @ManyToOne(
    () => HappinessLevel,
    (happinessLevel) => happinessLevel.systemFactions
  )
  @JoinColumn({ name: "happiness_level_id" })
  public happinessLevel?: HappinessLevel;

  /**
   * One to Many with FactionState - Active States
   */
  @OneToMany(() => ActiveState, (factionState) => factionState.systemFaction)
  public activeStates?: ActiveState[];

  /**
   * One to Many with Pending States
   */
  @OneToMany(() => PendingState, (pendingState) => pendingState.systemFaction, {
    cascade: ["insert"]
  })
  public pendingStates?: PendingState[];

  /**
   * One to Many with Recovering States
   */
  @OneToMany(
    () => RecoveringState,
    (recoveringState) => recoveringState.systemFaction,
    { cascade: ["insert"] }
  )
  public recoveringStates?: RecoveringState[];
}
