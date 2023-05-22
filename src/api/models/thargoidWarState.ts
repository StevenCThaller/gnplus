import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity
} from "typeorm";
import ThargoidWar from "./thargoidWar";

@Entity("thargoid_war_states")
export default class ThargoidWarState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "war_state", nullable: false, unique: true })
  public warState!: string;

  /**
   * One to Many with Thargoid Wars - Current
   */
  @OneToMany(() => ThargoidWar, (thargoidWar) => thargoidWar.currentState)
  public currentWars!: ThargoidWar[];

  /**
   * One to Many with Thargoid Wars - Next Fail
   */
  @OneToMany(() => ThargoidWar, (thargoidWar) => thargoidWar.nextStateFailure)
  public nextWarsIfFail!: ThargoidWar[];

  /**
   * One to Many with Thargoid Wars - Next Success
   */
  @OneToMany(() => ThargoidWar, (thargoidWar) => thargoidWar.nextStateSuccess)
  public nextWarsIfSucceed!: ThargoidWar[];
}
