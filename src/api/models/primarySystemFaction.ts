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
import StarSystem from "./starSystem";
import Faction from "./faction";
import FactionState from "./factionState";

@Entity("primary_system_factions")
export default class PrimarySystemFaction extends BaseEntity {
  /**
   * One to One with System - Primary Key
   */
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress!: number;
  @OneToOne(() => StarSystem, (starSystem) => starSystem.primaryFaction)
  @JoinColumn({ name: "system_address" })
  public system!: StarSystem;

  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id" })
  public factionId!: number;
  @ManyToOne(() => Faction, (faction) => faction.systemsWithPrimary)
  @JoinColumn({ name: "faction_id" })
  public faction!: Faction;

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id" })
  public factionStateId!: number;
  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.systemsWithState
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState!: FactionState;

  /**
   * Timestamps
   */
  @Column({
    name: "created_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP"
  })
  public createdAt!: Date;
  @Column({
    name: "updated_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt!: Date;
}
