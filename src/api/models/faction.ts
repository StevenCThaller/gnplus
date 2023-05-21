import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  BaseEntity
} from "typeorm";
import StationFaction from "./stationFaction";

@Entity("factions")
export default class Faction extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "faction_name", unique: true, nullable: false })
  public factionName!: string;

  @OneToMany(() => StationFaction, (stationFaction) => stationFaction.faction)
  public stationFactions!: StationFaction[];
}
