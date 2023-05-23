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

@Entity("recovering_states")
@Index(["systemFactionId", "factionState"])
export default class RecoveringState extends BaseEntity {
  @PrimaryGeneratedColumn()
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
    (systemFaction) => systemFaction.recoveringStates,
    { cascade: ["insert"], createForeignKeyConstraints: false, nullable: true }
  )
  @JoinColumn({ name: "system_faction_id" })
  public systemFaction?: SystemFaction;

  /**
   * Many to One with Faction State - Primary Key
   */
  @Column({ name: "faction_state_id", nullable: true })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.recoveringSystemFactions,
    { cascade: ["insert"], createForeignKeyConstraints: false, nullable: true }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Trend
   */
  @Column({ type: "float" })
  public trend?: number;
}
