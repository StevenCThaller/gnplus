import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  JoinTable,
  BaseEntity
} from "typeorm";
import Station from "./station";
import StationFaction from "./stationFaction";

@Entity()
export default class FactionState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "faction_state", unique: true, nullable: false })
  public factionState!: string;

  @OneToMany(
    () => StationFaction,
    (stationFaction) => stationFaction.factionState
  )
  public stationFactions!: Station[];
}
