import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  BaseEntity
} from "typeorm";
import StationFaction from "./stationFaction";
import PrimarySystemFaction from "./primarySystemFaction";
import SystemFaction from "./systemFaction";
import ConflictFaction from "./conflictFaction";

@Entity("factions")
export default class Faction extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "faction_name", unique: true, nullable: false })
  public factionName!: string;

  @OneToMany(() => StationFaction, (stationFaction) => stationFaction.faction)
  public stationFactions!: StationFaction[];

  @OneToMany(
    () => PrimarySystemFaction,
    (primarySystemFaction) => primarySystemFaction.faction
  )
  public systemsWithPrimary!: PrimarySystemFaction[];

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.faction)
  public systemFactions!: SystemFaction[];

  @OneToMany(
    () => ConflictFaction,
    (conflictFaction) => conflictFaction.faction
  )
  public conflicts!: ConflictFaction;
}
