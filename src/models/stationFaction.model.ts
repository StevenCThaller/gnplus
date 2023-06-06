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
@Index(["factionId", "factionStateId"])
export default class StationFaction {
  @PrimaryGeneratedColumn()
  public id?: number;

  @OneToOne(() => Station)
  public station?: Station;

  @Column({ name: "faction_id", nullable: true })
  public factionId!: number;

  @ManyToOne(() => Faction, (faction) => faction.stationFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "faction_id" })
  public faction?: Faction;

  @Column({ name: "faction_state_id", type: "tinyint", unsigned: true, nullable: true })
  public factionStateId!: number;

  @ManyToOne(() => FactionState, (factionState) => factionState.stationFactions, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "faction_state_id" })
  public factionState?: FactionState;

  constructor(factionId: number, factionStateId?: number) {
    this.factionId = factionId;
    if (factionStateId) this.factionStateId = factionStateId;
  }

  public static convertDocked(data: DockedData): StationFactionParams {
    return {
      faction: data.StationFaction.Name,
      factionState: data.StationFaction.FactionState
    };
  }
}
