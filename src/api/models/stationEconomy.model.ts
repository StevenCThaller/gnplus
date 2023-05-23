import {
  Entity,
  Unique,
  Index,
  ManyToOne,
  Column,
  OneToOne,
  PrimaryColumn,
  JoinColumn,
  BaseEntity,
  PrimaryGeneratedColumn
} from "typeorm";
import Station from "./station.model";
import Economy from "./economy.model";

@Entity("station_economies")
export default class StationEconomy extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "station_id", unsigned: true })
  public stationId?: number;

  @Column({ name: "economy_id", nullable: true })
  public economyId?: number;

  @ManyToOne(() => Station, (station) => station.stationEconomies)
  @JoinColumn({ name: "station_id" })
  public station?: Station;

  @ManyToOne(() => Economy, (economy) => economy.stations)
  @JoinColumn({ name: "economy_id" })
  public economy?: Economy;

  @Column({ nullable: false, type: "float" })
  public proportion?: number;
}
