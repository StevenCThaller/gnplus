import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
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

@Entity("system_factions")
@Index(["systemAddress", "factionId"])
export default class SystemFaction {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ type: "float", nullable: true })
  public influence?: number;

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
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.systemFactions, {
    nullable: true,
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;
  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id", nullable: true })
  public factionId?: number;
  @ManyToOne(() => Faction, (faction) => faction.systemFactions, { cascade: false })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  /**
   * Many to One with Allegiance
   */
  @Column({ name: "allegiance_id", type: "tinyint", unsigned: true, nullable: true })
  public allegianceId?: number;
  @ManyToOne(() => Allegiance, (allegiance) => allegiance.systemFactions)
  @JoinColumn({ name: "allegiance_id" })
  public allegiance?: Allegiance;

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id", type: "tinyint", unsigned: true, nullable: true })
  public factionStateId?: number;
  @ManyToOne(() => FactionState, (factionState) => factionState.systemFactions)
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Many to One with Government
   */
  @Column({ name: "government_id", type: "tinyint", unsigned: true, nullable: true })
  public governmentId?: number;
  @ManyToOne(() => Government, (government) => government.systemFactions)
  @JoinColumn({ name: "government_id" })
  public government?: Government;

  /**
   * Many to One with HappinessLevel
   */
  @Column({ name: "happiness_level_id", type: "tinyint", unsigned: true, nullable: true })
  public happinessLevelId?: number;
  @ManyToOne(() => HappinessLevel, (happinessLevel) => happinessLevel.systemFactions)
  @JoinColumn({ name: "happiness_level_id" })
  public happinessLevel?: HappinessLevel;

  /**
   * Many to Many with FactionState - Active States
   */
  @ManyToMany(() => FactionState, (factionState) => factionState.activeStateSystemFactions, {
    cascade: ["update"]
  })
  @JoinTable({
    name: "faction_has_active_states",
    joinColumn: {
      name: "system_faction_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "faction_state_id",
      referencedColumnName: "id"
    }
  })
  public activeStates?: FactionState[];

  /**
   * One to Many with Pending States
   */
  @ManyToMany(() => PendingState, (pendingState) => pendingState.systemFactions, {
    cascade: ["insert", "update"]
  })
  @JoinTable({
    name: "faction_has_pending_states",
    joinColumn: {
      name: "system_faction_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "pending_state_id",
      referencedColumnName: "id"
    }
  })
  public pendingStates?: PendingState[];

  /**
   * One to Many with Recovering States
   */
  @ManyToMany(() => RecoveringState, (recoveringState) => recoveringState.systemFactions, {
    cascade: ["insert", "update"]
  })
  @JoinTable({
    name: "faction_has_recovering_states",
    joinColumn: {
      name: "system_faction_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "recovering_state_id",
      referencedColumnName: "id"
    }
  })
  public recoveringStates?: RecoveringState[];

  public static convertFSDJump(data: FSDJumpData): SystemFactionParams[] {
    if (!data.Factions) return [];
    return data.Factions.map(
      (systemFaction: SystemFactionJump): SystemFactionParams => ({
        systemAddress: data.SystemAddress,
        faction: systemFaction.Name,
        factionState: systemFaction.FactionState,
        influence: systemFaction.Influence,
        allegiance: systemFaction.Allegiance,
        government: systemFaction.Government.startsWith("$government_")
          ? systemFaction.Government
          : `$government_${systemFaction.Government};`,
        happinessLevel: systemFaction.Happiness ? systemFaction.Happiness : "--",
        activeStates: systemFaction.ActiveStates?.map(
          (activeState: ActiveStateJump): ActiveStateParams => activeState.State
        ),
        pendingStates: systemFaction.PendingStates?.map(
          (pendingState: TrendingStateJump): TrendingStateParams => ({
            factionState: pendingState.State,
            trend: pendingState.Trend
          })
        ),
        recoveringStates: systemFaction.RecoveringStates?.map(
          (recoveringState: TrendingStateJump): TrendingStateParams => ({
            factionState: recoveringState.State,
            trend: recoveringState.Trend
          })
        )
      })
    );
  }

  /**
   *
   */
  constructor(
    systemAddress: number,
    factionId: number,
    allegianceId: number,
    happinessLevelId: number,
    governmentId: number,
    influence: number,
    factionStateId?: number
  ) {
    this.systemAddress = systemAddress;
    this.factionId = factionId;
    this.allegianceId = allegianceId;
    this.happinessLevelId = happinessLevelId;
    this.governmentId = governmentId;
    this.influence = influence;
    this.factionStateId = factionStateId;
  }
}
