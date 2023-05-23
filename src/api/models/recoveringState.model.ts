import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  JoinColumn
} from "typeorm";
import SystemFaction from "./systemFaction.model";
import FactionState from "./factionState.model";

@Entity("recovering_states")
export default class RecoveringState extends BaseEntity {
  /**
   * Many to One with System Faction - Primary Key
   */
  @PrimaryColumn({
    name: "system_faction_id",
    type: "bigint",
    unsigned: true,
    nullable: false
  })
  public systemFactionId?: number;
  @ManyToOne(
    () => SystemFaction,
    (systemFaction) => systemFaction.recoveringStates,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "system_faction_id" })
  public systemFaction?: SystemFaction;

  /**
   * Many to One with Faction State - Primary Key
   */
  @PrimaryColumn({ name: "faction_state_id", nullable: false })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.recoveringSystemFactions,
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
