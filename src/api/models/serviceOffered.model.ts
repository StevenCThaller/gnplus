import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  BaseEntity
} from "typeorm";
import Station from "./station.model";

@Entity("services")
export default class ServiceOffered extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "service", unique: true, nullable: false })
  public service?: string;

  @Column({ name: "localised_en", unique: true, nullable: true })
  public localisedEN?: string;

  @ManyToMany((type) => Station, (station) => station.servicesAvailable, {
    cascade: ["insert"]
  })
  public stationsOfferingThisService?: Station[];
}
