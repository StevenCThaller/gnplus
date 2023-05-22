import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  BaseEntity
} from "typeorm";
import Station from "./station";
import StationEconomy from "./stationEconomy";
import SystemEconomy from "./systemEconomy";
import StarSystem from "./starSystem";

@Entity("economies")
export default class Economy extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "economy_name", nullable: false, unique: true })
  public economyName!: string;

  @Column({ name: "localised_en", nullable: true, unique: true })
  public localisedEN!: string;

  @Column({ name: "localised_es", nullable: true, unique: true })
  public localisedES!: string;

  // @OneToMany((type) => Station, (station) => station.primaryEconomy)
  // public stationsWithThisEconomyAsPrimary!: Station[];

  @OneToMany(() => StationEconomy, (stationEconomy) => stationEconomy.economy)
  public stations!: Station[];

  @OneToMany(
    () => SystemEconomy,
    (systemEconomy) => systemEconomy.primaryEconomy
  )
  public systemsWithPrimary!: StarSystem[];

  @OneToMany(
    () => SystemEconomy,
    (systemEconomy) => systemEconomy.secondaryEconomy
  )
  public systemsWithSecondary!: StarSystem[];
}
