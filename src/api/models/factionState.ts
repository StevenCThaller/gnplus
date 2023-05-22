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
import Station from "./station";
import StationFaction from "./stationFaction";
import PrimarySystemFaction from "./primarySystemFaction";
import SystemFaction from "./systemFaction";
import PendingState from "./pendingState";
import RecoveringState from "./recoveringState";

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

  @OneToMany(
    () => PrimarySystemFaction,
    (primarySystemFaction) => primarySystemFaction.factionState
  )
  public systemsWithState!: PrimarySystemFaction;

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.factionState)
  public systemFactions!: SystemFaction[];

  @OneToMany(() => PendingState, (pendingState) => pendingState.factionState)
  public pendingSystemFactions!: PendingState[];

  @OneToMany(
    () => RecoveringState,
    (recoveringState) => recoveringState.factionState
  )
  public recoveringSystemFactions!: RecoveringState[];
}
