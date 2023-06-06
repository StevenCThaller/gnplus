import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  ManyToMany
} from "typeorm";
import SystemFaction from "./systemFaction.model";
import FactionState from "./factionState.model";

@Entity("pending_states")
@Index(["factionStateId", "trend"])
export default class PendingState extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @ManyToMany(() => SystemFaction, (systemFaction) => systemFaction.pendingStates)
  public systemFactions?: SystemFaction[];

  /**
   * Many to One with Faction State - Primary Key
   */
  @Column({
    name: "faction_state_id",
    nullable: true
  })
  public factionStateId?: number;
  @ManyToOne(() => FactionState, (factionState) => factionState.pendingSystemFactions, {
    cascade: ["insert"],
    createForeignKeyConstraints: false,
    nullable: false
  })
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Trend
   */
  @Column({ type: "float" })
  public trend?: number;
}
