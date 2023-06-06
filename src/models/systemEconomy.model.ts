import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index
} from "typeorm";
import StarSystem from "./starSystem.model";
import Economy from "./economy.model";

@Entity("system_economies")
@Index(["primaryEconomyId", "secondaryEconomyId"])
export default class SystemEconomy extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true, type: "bigint" })
  public id?: number;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.systemEconomy)
  public systems?: StarSystem[];

  @Column({ name: "primary_economy_id", nullable: true })
  public primaryEconomyId?: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithPrimary, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "primary_economy_id" })
  public primaryEconomy?: Economy;

  @Column({ name: "secondary_economy_id", nullable: true })
  public secondaryEconomyId?: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithSecondary, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "secondary_economy_id" })
  public secondaryEconomy?: Economy;

  public static convertFSDJump(data: FSDJumpData): SystemEconomyParams {
    return {
      primaryEconomy: data.SystemEconomy,
      secondaryEconomy: data.SystemSecondEconomy
    };
  }
}
