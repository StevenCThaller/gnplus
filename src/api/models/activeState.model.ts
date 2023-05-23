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

@Entity("active_states")
@Index(["systemFactionId", "factionStateId"])
export default class ActiveState extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;
  /**
   * Many to One with System Faction - Primary Key
   */
  @Column({
    name: "system_faction_id",
    type: "bigint",
    unsigned: true,
    nullable: true,
    foreignKeyConstraintName: "active_state_system_faction"
  })
  public systemFactionId?: number;
  @ManyToOne(
    () => SystemFaction,
    (systemFaction) => systemFaction.activeStates,
    { cascade: ["insert"], createForeignKeyConstraints: false, nullable: true }
  )
  @JoinColumn({ name: "system_faction_id" })
  public systemFaction?: SystemFaction;

  /**
   * Many to One with Faction State - Primary Key
   */
  @Column({
    name: "faction_state_id",
    foreignKeyConstraintName: "active_state_faction_state",
    nullable: true
  })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.pendingSystemFactions,
    { cascade: ["insert"], createForeignKeyConstraints: false, nullable: false }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;
}
