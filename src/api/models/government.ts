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
import SystemFaction from "./systemFaction";
import StarSystem from "./starSystem";

@Entity("governments")
export default class Government extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "government", nullable: false, unique: true })
  public government!: string;

  @Column({ name: "localised_en", nullable: true, unique: true })
  public localisedEN?: string;

  @Column({ name: "localised_es", nullable: true, unique: true })
  public localisedES?: string;

  @OneToMany(() => Station, (station) => station.government, {
    cascade: ["insert"]
  })
  public stations!: Station[];

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.government)
  public systemFactions!: SystemFaction[];

  @OneToMany(() => StarSystem, (starSystem) => starSystem.government)
  public systems!: StarSystem[];
}
