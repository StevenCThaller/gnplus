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
import Faction from "./faction.model";
import FactionState from "./factionState.model";

@Entity("station_factions")
@Index(["stationId", "factionId"])
export default class StationFaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "station_id", unsigned: true, unique: true })
  public stationId?: number;

  @OneToOne(() => Station, (station) => station.stationFaction)
  @JoinColumn({ name: "station_id" })
  public station?: Station;

  @Column({ name: "faction_id" })
  public factionId?: number;

  @ManyToOne(() => Faction, (faction) => faction.stationFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  @Column({ name: "faction_state_id", nullable: true })
  public factionStateId?: number;

  @ManyToOne(
    () => FactionState,
    (factionState) => factionState.stationFactions,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  @Column({
    name: "created_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP"
  })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;
}
