import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  JoinColumn,
  Index,
  ManyToMany
} from "typeorm";
import SystemFaction from "./systemFaction.model";
import FactionState from "./factionState.model";

@Entity("recovering_states")
@Index(["factionStateId", "trend"])
export default class RecoveringState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  /**
   * Many to Many with System Faction
   */
  @ManyToMany(() => SystemFaction, (systemFaction) => systemFaction.recoveringStates)
  public systemFactions?: SystemFaction[];

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id", nullable: true })
  public factionStateId?: number;
  @ManyToOne(() => FactionState, (factionState) => factionState.recoveringSystemFactions, {
    cascade: ["insert"],
    createForeignKeyConstraints: false,
    nullable: true
  })
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Trend
   */
  @Column({ type: "float" })
  public trend?: number;
}
