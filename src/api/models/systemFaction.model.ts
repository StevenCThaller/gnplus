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
import HappinessLevel from "./happiness.model";
import Faction from "./faction.model";
import PendingState from "./pendingState.model";
import RecoveringState from "./recoveringState.model";

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
    nullable: true
  })
  public systemAddress?: number;
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.systemFactions)
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
   * Many to One with Happiness
   */
  @Column({ name: "happiness_id", nullable: false })
  public happinessId?: number;
  @ManyToOne(
    () => HappinessLevel,
    (happinessLevel) => happinessLevel.systemFactions,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "happiness_id" })
  public happiness?: HappinessLevel;

  /**
   * Many to Many with FactionState - Active States
   */
  @ManyToMany(
    () => FactionState,
    (factionState) => factionState.systemFactions,
    { cascade: ["insert"] }
  )
  @JoinTable({
    name: "system_faction_active_states",
    joinColumn: { name: "system_faction_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "faction_state_id", referencedColumnName: "id" }
  })
  public activeStates?: FactionState[];

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
    { cascade: ["insert", "update"] }
  )
  public recoveringStates?: RecoveringState[];
}
