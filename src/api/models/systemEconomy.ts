import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import StarSystem from "./starSystem";
import Economy from "./economy";

@Entity("system_economies")
export default class SystemEconomy extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true, type: "bigint" })
  public id!: number;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.systemEconomy)
  public systems!: StarSystem[];

  @Column({ name: "primary_economy_id" })
  public primaryEconomyId!: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithPrimary, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "primary_economy_id" })
  public primaryEconomy!: Economy;

  @Column({ name: "secondary_economy_id", nullable: true })
  public secondaryEconomyId?: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithSecondary, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "secondary_economy_id" })
  public secondaryEconomy?: Economy;
}
