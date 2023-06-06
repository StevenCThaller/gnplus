import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  JoinTable,
  BaseEntity,
  ManyToOne,
  ManyToMany
} from "typeorm";
import Station from "./station.model";
import StationFaction from "./stationFaction.model";
import PrimarySystemFaction from "./primarySystemFaction.model";
import SystemFaction from "./systemFaction.model";
import PendingState from "./pendingState.model";
import RecoveringState from "./recoveringState.model";

@Entity("faction_states")
export default class FactionState {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  public id!: number;

  @Column({ name: "faction_state", unique: true, nullable: false })
  public factionState!: string;

  @OneToMany(() => StationFaction, (stationFaction) => stationFaction.factionState)
  public stationFactions!: Station[];

  @OneToMany(
    () => PrimarySystemFaction,
    (primarySystemFaction) => primarySystemFaction.factionState
  )
  public systemsWithState?: PrimarySystemFaction;

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.factionState)
  public systemFactions?: SystemFaction[];

  @OneToMany(() => PendingState, (pendingState) => pendingState.factionState)
  public pendingSystemFactions?: PendingState[];

  @OneToMany(() => RecoveringState, (recoveringState) => recoveringState.factionState)
  public recoveringSystemFactions?: RecoveringState[];

  @ManyToMany(() => SystemFaction, (systemFaction) => systemFaction.activeStates)
  public activeStateSystemFactions?: SystemFaction[];

  constructor(factionState: string) {
    this.factionState = factionState;
  }
}
