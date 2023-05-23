import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  JoinTable,
  BaseEntity,
  ManyToOne
} from "typeorm";
import Station from "./station.model";
import StationFaction from "./stationFaction.model";
import PrimarySystemFaction from "./primarySystemFaction.model";
import SystemFaction from "./systemFaction.model";
import PendingState from "./pendingState.model";
import RecoveringState from "./recoveringState.model";

@Entity()
export default class FactionState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "faction_state", unique: true, nullable: false })
  public factionState?: string;

  @OneToMany(
    () => StationFaction,
    (stationFaction) => stationFaction.factionState
  )
  public stationFactions?: Station[];

  @OneToMany(
    () => PrimarySystemFaction,
    (primarySystemFaction) => primarySystemFaction.factionState
  )
  public systemsWithState?: PrimarySystemFaction;

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.factionState)
  public systemFactions?: SystemFaction[];

  @OneToMany(() => PendingState, (pendingState) => pendingState.factionState)
  public pendingSystemFactions?: PendingState[];

  @OneToMany(
    () => RecoveringState,
    (recoveringState) => recoveringState.factionState
  )
  public recoveringSystemFactions?: RecoveringState[];
}
