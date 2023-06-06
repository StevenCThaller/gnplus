import { Entity, PrimaryGeneratedColumn, OneToMany, Column, BaseEntity } from "typeorm";
import Station from "./station.model";

@Entity("station_types")
export default class StationType extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  public id?: number;

  @Column({ name: "station_type", unique: true, nullable: false })
  public stationType?: string;

  @OneToMany(() => Station, (station) => station.stationType)
  public stationsWithThisType?: Station[];
}
