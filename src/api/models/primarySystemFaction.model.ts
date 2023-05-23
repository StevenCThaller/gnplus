import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import StarSystem from "./starSystem.model";
import Faction from "./faction.model";
import FactionState from "./factionState.model";

@Entity("primary_system_factions")
export default class PrimarySystemFaction extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  /**
   * One to One with System
   */
  @Column({
    name: "system_address",
    type: "bigint",
    nullable: true,
    unsigned: true
  })
  public systemAddress?: number;

  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id" })
  public factionId?: number;
  @ManyToOne(() => Faction, (faction) => faction.systemsWithPrimary, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id", nullable: true })
  public factionStateId?: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.systemsWithState,
    { cascade: ["insert", "update"] }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  /**
   * Timestamps
   */
  @Column({
    name: "created_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP"
  })
  public createdAt?: Date;
  @Column({
    name: "updated_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;
}
