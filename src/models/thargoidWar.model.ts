import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  OneToOne
} from "typeorm";
import ThargoidWarState from "./thargoidWarState.model";
import StarSystem from "./starSystem.model";

@Entity("thargoid_wars")
export default class ThargoidWar extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "remaining_ports" })
  public remainingPorts?: number;

  @Column({ name: "war_progress", type: "float" })
  public warProgress?: number;

  @Column({ name: "estimated_remaining_time", default: null, nullable: true })
  public estimatedRemainingTime?: string;

  @Column({ name: "success_state_reached" })
  public successStateReached?: boolean;

  /**
   * One to One with Star System
   */
  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true,
    unique: true,
    nullable: true
  })
  public systemAddress?: number;
  @OneToOne(() => StarSystem, (starSystem) => starSystem.thargoidWar, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;

  /**
   * Many to One with Thargoid War State - Current State
   */
  @Column({ name: "current_state_id", nullable: true })
  public currentStateId?: number;
  @ManyToOne(() => ThargoidWarState, (thargoidWarState) => thargoidWarState.currentWars, {
    cascade: ["insert", "update"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "current_state_id" })
  public currentState?: ThargoidWarState;

  /**
   * Many to One with Thargoid War State - Next State Failure
   */
  @Column({ name: "next_state_failure_id", nullable: true })
  public nextStateFailureId?: number;
  @ManyToOne(() => ThargoidWarState, (thargoidWarState) => thargoidWarState.nextWarsIfFail, {
    cascade: ["insert", "update"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "next_state_failure_id" })
  public nextStateFailure?: ThargoidWarState;

  /**
   * Many to One with Thargoid War State - Next State Success
   */
  @Column({ name: "next_state_success_id", nullable: true })
  public nextStateSuccessId?: number;
  @ManyToOne(() => ThargoidWarState, (thargoidWarState) => thargoidWarState.nextWarsIfSucceed, {
    cascade: ["insert", "update"],
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "next_state_success_id" })
  public nextStateSuccess?: ThargoidWarState;

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

  public static convertFSDJump(data: FSDJumpData): ThargoidWarParams {
    const { ThargoidWar } = data;
    return {
      systemAddress: data.SystemAddress,
      remainingPorts: ThargoidWar.RemainingPorts,
      warProgress: ThargoidWar.WarProgress,
      estimatedRemainingTime: ThargoidWar.EstimatedRemainingTime,
      successStateReached: ThargoidWar.SuccessStateReached,
      currentState: ThargoidWar.CurrentState || "Unknown",
      nextStateFailure: ThargoidWar.NextStateFailure || "Unknown",
      nextStateSuccess: ThargoidWar.NextStateSuccess || "Unknown",
      createdAt: new Date(data.timestamp),
      updatedAt: new Date(data.timestamp)
    };
  }
}
