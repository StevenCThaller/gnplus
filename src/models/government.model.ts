import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from "typeorm";
import Station from "./station.model";
import SystemFaction from "./systemFaction.model";
import StarSystem from "./starSystem.model";

@Entity("governments")
export default class Government {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
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
  public stations?: Station[];

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.government)
  public systemFactions?: SystemFaction[];

  @OneToMany(() => StarSystem, (starSystem) => starSystem.government)
  public systems?: StarSystem[];

  constructor(government: string, localisedEN?: string) {
    this.government = government.startsWith("$government_")
      ? government
      : `$government_${government};`;
    if (localisedEN) this.localisedEN = localisedEN;
  }
}
