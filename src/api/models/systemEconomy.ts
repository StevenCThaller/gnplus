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

  @Column({
    name: "system_address",
    type: "bigint",
    unsigned: true,
    unique: true
  })
  public systemAddress!: number;
  @OneToOne(() => StarSystem, (starSystem) => starSystem.systemEconomy)
  @JoinColumn({ name: "system_address" })
  public system!: StarSystem;

  @Column({ name: "primary_economy_id" })
  public primaryEconomyId!: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithPrimary)
  @JoinColumn({ name: "primary_economy_id" })
  public primaryEconomy!: Economy;

  @Column({ name: "secondary_economy_id", nullable: true })
  public secondaryEconomyId?: number;

  @ManyToOne(() => Economy, (economy) => economy.systemsWithSecondary)
  @JoinColumn({ name: "secondary_column_id" })
  public secondaryEconomy?: Economy;

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
