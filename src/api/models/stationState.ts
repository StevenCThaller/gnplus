import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity
} from "typeorm";
import Station from "./station";

@Entity("station_states")
export default class StationState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "station_state", unique: true, nullable: false })
  public stationState!: string;

  @OneToMany(() => Station, (station) => station.stationState)
  public stationsWithThisState!: Station[];
}
