import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import Faction from "./faction";
import SystemConflict from "./systemConflict";

@Entity("conflict_factions")
export default class ConflictFaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "stake" })
  public stake!: string;

  @Column({ name: "won_days" })
  public wonDays!: number;

  /**
   * One to One with Conflict - Faction One
   */
  @OneToOne(() => SystemConflict, (systemConflict) => systemConflict.factionOne)
  public factionOneInConflict!: SystemConflict;

  /**
   * One to One with Conflict - Faction Two
   */
  @OneToOne(() => SystemConflict, (systemConflict) => systemConflict.factionTwo)
  public factionTwoInConflict!: SystemConflict;

  /**
   * Many to One with Faction
   */
  @Column({ name: "faction_id" })
  public factionId!: number;
  @ManyToOne(() => Faction, (faction) => faction.conflicts)
  @JoinColumn({ name: "faction_id" })
  public faction!: Faction;
}
