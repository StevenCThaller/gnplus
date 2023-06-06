import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index, BaseEntity } from "typeorm";
import StationFaction from "./stationFaction.model";
import PrimarySystemFaction from "./primarySystemFaction.model";
import SystemFaction from "./systemFaction.model";
import ConflictFaction from "./conflictFaction.model";

@Entity("factions")
export default class Faction {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "faction_name", unique: true, nullable: false })
  public factionName!: string;

  @OneToMany(() => StationFaction, (stationFaction) => stationFaction.faction)
  public stationFactions?: StationFaction[];

  @OneToMany(() => PrimarySystemFaction, (primarySystemFaction) => primarySystemFaction.faction)
  public systemsWithPrimary?: PrimarySystemFaction[];

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.faction)
  public systemFactions?: SystemFaction[];

  @OneToMany(() => ConflictFaction, (conflictFaction) => conflictFaction.faction)
  public conflicts?: ConflictFaction;

  constructor(factionName: string) {
    this.factionName = factionName;
  }
}
