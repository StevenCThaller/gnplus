import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  JoinColumn
} from "typeorm";
import SystemFaction from "./systemFaction";
import FactionState from "./factionState";

@Entity("recovering_states")
export default class RecoveringState extends BaseEntity {
  /**
   * Many to One with System Faction - Primary Key
   */
  @PrimaryColumn({ name: "system_faction_id", type: "bigint", unsigned: true })
  public systemFactionId!: number;
  @ManyToOne(
    () => SystemFaction,
    (systemFaction) => systemFaction.recoveringStates
  )
  @JoinColumn({ name: "system_faction_id" })
  public systemFaction!: SystemFaction;

  /**
   * Many to One with Faction State - Primary Key
   */
  @PrimaryColumn({ name: "faction_state_id" })
  public factionStateId!: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.recoveringSystemFactions
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState!: FactionState;

  /**
   * Trend
   */
  @Column({ type: "float" })
  public trend!: number;
}
