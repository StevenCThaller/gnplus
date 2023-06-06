import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  BaseEntity
} from "typeorm";
import Station from "./station.model";
import StationEconomy from "./stationEconomy.model";
import SystemEconomy from "./systemEconomy.model";
import StarSystem from "./starSystem.model";

@Entity("economies")
export default class Economy {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "economy_name", nullable: false, unique: true })
  public economyName?: string;

  @Column({ name: "localised_en", nullable: true, unique: true })
  public localisedEN?: string;

  @Column({ name: "localised_es", nullable: true, unique: true })
  public localisedES?: string;

  // @OneToMany(() =>  Station, (station) => station.primaryEconomy)
  // public stationsWithThisEconomyAsPrimary?: Station[];

  @OneToMany(() => StationEconomy, (stationEconomy) => stationEconomy.economy)
  public stations?: Station[];

  @OneToMany(() => SystemEconomy, (systemEconomy) => systemEconomy.primaryEconomy)
  public systemsWithPrimary?: StarSystem[];

  @OneToMany(() => SystemEconomy, (systemEconomy) => systemEconomy.secondaryEconomy)
  public systemsWithSecondary?: StarSystem[];

  constructor(economyName: string) {
    this.economyName = economyName;
  }
}
