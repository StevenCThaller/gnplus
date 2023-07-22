import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import Faction from "./faction.model";
import SystemConflict from "./systemConflict.model";

@Entity("conflict_factions")
export default class ConflictFaction {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true,
    nullable: false
  })
  @Index()
  public systemAddress?: number;

  @Column({ name: "stake" })
  public stake?: string;

  @Column({ name: "won_days" })
  public wonDays?: number;

  /**
   * One to One with Conflict - Faction One
   */
  @OneToOne(() => SystemConflict, (systemConflict) => systemConflict.factionOne)
  public factionOneInConflict?: SystemConflict;

  /**
   * One to One with Conflict - Faction Two
   */
  @OneToOne(() => SystemConflict, (systemConflict) => systemConflict.factionTwo)
  public factionTwoInConflict?: SystemConflict;

  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id" })
  @Index()
  public factionId?: number;
  @ManyToOne(() => Faction, (faction) => faction.conflicts)
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  @Column({
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false
  })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: false
  })
  public updatedAt?: Date;

  public static convertFSDJump(
    systemAddress: number,
    data: ConflictFactionJump
  ): ConflictFactionParams {
    return {
      systemAddress,
      faction: data.Name,
      stake: data.Stake,
      wonDays: data.WonDays
    };
  }

  /**
   *
   */
  constructor(systemAddress: number, factionId: number, stake: string, wonDays: number) {
    this.systemAddress = systemAddress;
    this.factionId = factionId;
    this.stake = stake;
    this.wonDays = wonDays;
  }
}
