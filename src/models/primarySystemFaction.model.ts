import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Faction from "./faction.model";
import FactionState from "./factionState.model";

@Entity("primary_system_factions")
export default class PrimarySystemFaction {
  // @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  // public id?: number;

  /**
   * One to One with System
   */
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;

  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id" })
  public factionId?: number;
  @ManyToOne(() => Faction, (faction) => faction.systemsWithPrimary, {
    cascade: false,
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  /**
   * Many to One with Faction State
   */
  @Column({ name: "faction_state_id", type: "tinyint", unsigned: true, nullable: true })
  public factionStateId?: number;
  @ManyToOne(() => FactionState, (factionState) => factionState.systemsWithState, {
    cascade: ["insert"]
  })
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

  public static convertFSDJump(data: FSDJumpData): PrimarySystemFactionParams | undefined {
    if (!data.SystemFaction) return;
    return {
      systemAddress: data.SystemAddress,
      faction: data.SystemFaction?.Name,
      factionState: data.SystemFaction?.FactionState,
      createdAt: new Date(data.timestamp),
      updatedAt: new Date(data.timestamp)
    };
  }

  constructor(systemAddress: number, factionId: number, factionStateId?: number) {
    if (!systemAddress) return this;

    this.systemAddress = systemAddress;
    this.factionId = factionId;
    this.factionStateId = factionStateId;
  }
}
