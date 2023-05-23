import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  JoinColumn,
  Index
} from "typeorm";
import SystemFaction from "./systemFaction.model";
import FactionState from "./factionState.model";

@Entity("pending_states")
@Index(["systemFactionId", "factionStateId"])
export default class PendingState extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;
  /**
   * Many to One with System Faction - Primary Key
   */
  @Column({
    name: "system_faction_id",
    type: "bigint",
    unsigned: true,
    nullable: true
  })
  public systemFactionId?: number;
  @ManyToOne(
    () => SystemFaction,
    (systemFaction) => systemFaction.pendingStates,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "system_faction_id" })
  public systemFaction?: SystemFaction;

  /**
   * Many to One with Faction State - Primary Key
   */
  @PrimaryColumn({ name: "faction_state_id" })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.pendingSystemFactions,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Trend
   */
  @Column({ type: "float" })
  public trend?: number;
}
