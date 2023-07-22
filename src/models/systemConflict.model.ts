import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  Column,
  JoinColumn,
  BaseEntity,
  Index,
  PrimaryColumn
} from "typeorm";
import StarSystem from "./starSystem.model";
import ConflictFaction from "./conflictFaction.model";
import ConflictStatus from "./conflictStatus.model";
import ConflictWarType from "./conflictWarType.model";

@Entity("system_conflicts")
@Index("system_conflict_id", ["systemAddress", "factionOneId", "factionTwoId"], { unique: true })
export default class SystemConflict {
  /**
   * Many to One with Star System
   */
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.systemConflicts, {
    createForeignKeyConstraints: false,
    nullable: true
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;

  /**
   * One to One with First Conflict Faction
   */
  @PrimaryColumn({
    name: "faction_one_id"
  })
  public factionOneId?: number;
  @OneToOne(() => ConflictFaction, (conflictFaction) => conflictFaction.factionOneInConflict, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "faction_one_id" })
  public factionOne?: ConflictFaction;

  /**
   * One to One with Second Conflict Faction
   */
  @PrimaryColumn({
    name: "faction_two_id"
  })
  public factionTwoId?: number;
  @OneToOne(() => ConflictFaction, (conflictFaction) => conflictFaction.factionTwoInConflict, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "faction_two_id" })
  public factionTwo?: ConflictFaction;

  /**
   * Many to One with Conflict Status
   */
  @Column({ name: "conflict_status_id", nullable: true })
  public conflictStatusId?: number;
  @ManyToOne(() => ConflictStatus, (conflictStatus) => conflictStatus.conflicts, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "conflict_status_id" })
  public conflictStatus?: ConflictStatus;

  /**
   * Many to One with Conflict War Types
   */
  @Column({ name: "war_type_id", nullable: true })
  public warTypeId?: number;
  @ManyToOne(() => ConflictWarType, (conflictWarType) => conflictWarType.conflicts, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "war_type_id" })
  public warType?: ConflictWarType;

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

  public static convertFSDJump(data: FSDJumpData): SystemConflictParams[] {
    if (!data.Conflicts) return [];
    return data.Conflicts.map(
      (conflict: SystemConflictJump): SystemConflictParams => ({
        systemAddress: data.SystemAddress,
        factionOne: ConflictFaction.convertFSDJump(data.SystemAddress, conflict.Faction1),
        factionTwo: ConflictFaction.convertFSDJump(data.SystemAddress, conflict.Faction2),
        conflictStatus: conflict.Status,
        warType: conflict.WarType,
        createdAt: new Date(data.timestamp),
        updatedAt: new Date(data.timestamp)
      })
    );
  }

  constructor(
    systemAddress: number,
    factionOneId: number,
    factionTwoId: number,
    conflictStatusId: number,
    warTypeId: number
  ) {
    this.systemAddress = systemAddress;
    this.factionOneId = factionOneId;
    this.factionTwoId = factionTwoId;
    this.conflictStatusId = conflictStatusId;
    this.warTypeId = warTypeId;
  }
}
