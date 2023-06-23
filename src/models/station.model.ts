import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  BaseEntity,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import Allegiance from "./allegiance.model";
import StationType from "./stationType.model";
import LandingPadConfig from "./landingPadConfig.model";
import ServiceOffered from "./serviceOffered.model";
import Government from "./government.model";
import StationState from "./stationState.model";
import StarSystem from "./starSystem.model";
import StationFaction from "./stationFaction.model";
import StationEconomy from "./stationEconomy.model";
import Market from "./market.model";

@Entity("stations")
export default class Station {
  @PrimaryColumn({ type: "bigint", unsigned: true, unique: true })
  public id!: number;
  @OneToOne(() => Market, (market) => market.station)
  @JoinColumn({ name: "id", referencedColumnName: "id" })
  public commodityMarket?: Market;

  @Column({ name: "station_name", nullable: false })
  public stationName!: string;

  @Column({ name: "distance_from_arrival", type: "float", nullable: true })
  public distanceFromArrival?: number;

  /**
   * Timestamps
   */
  @Column({ name: "created_at", default: () => "CURRENT_TIMESTAMP", nullable: false })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;

  /**
   * Many to One Relationships
   */
  @Column({ name: "allegiance_id", type: "tinyint", unsigned: true, nullable: true })
  public allegianceId?: number;
  @ManyToOne(() => Allegiance, (allegiance) => allegiance.stations, {
    cascade: ["insert"],
    nullable: true
  })
  @JoinColumn({ name: "allegiance_id" })
  public allegiance?: Allegiance;

  @Column({ name: "government_id", type: "tinyint", unsigned: true })
  public governmentId?: number;
  @ManyToOne(() => Government, (government) => government.stations, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "government_id" })
  public government?: Government;

  @Column({ name: "station_type_id", type: "tinyint", nullable: true, unsigned: true })
  public stationTypeId?: number;
  @ManyToOne(() => StationType, (stationType) => stationType.stationsWithThisType, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "station_type_id" })
  public stationType?: StationType;

  @Column({ name: "landing_pad_configuration_id", nullable: true })
  public landingPadId?: number;
  @ManyToOne(
    () => LandingPadConfig,
    (landingPadConfig) => landingPadConfig.stationsWithThisConfiguration,
    {
      cascade: ["insert"],
      nullable: true
    }
  )
  @JoinColumn({ name: "landing_pad_configuration_id" })
  public landingPads?: LandingPadConfig;

  @Column({ name: "station_state_id", type: "tinyint", unsigned: true, nullable: true })
  public stationStateId?: number;
  @ManyToOne(() => StationState, (stationState) => stationState.stationsWithThisState, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "station_state_id" })
  public stationState?: StationState;

  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @ManyToOne(() => StarSystem, (starSystem) => starSystem.stationsInSystem, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({ name: "system_address" })
  public starSystem?: StarSystem;

  @Column({ name: "station_faction_id" })
  public stationFactionId?: number;
  @ManyToOne(() => StationFaction, (stationFaction) => stationFaction.station)
  @JoinColumn({ name: "station_faction_id" })
  public stationFaction?: StationFaction;

  /**
   * Many to Many Relationships
   */
  @OneToMany(() => StationEconomy, (stationEconomy) => stationEconomy.station, {
    cascade: ["insert"]
  })
  public stationEconomies?: StationEconomy[];

  @ManyToMany(() => ServiceOffered, (service) => service.stationsOfferingThisService, {
    cascade: ["insert"]
  })
  @JoinTable({
    name: "station_has_services",
    joinColumn: { name: "station_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "service_id", referencedColumnName: "id" }
  })
  public servicesAvailable?: ServiceOffered[];

  public static convertDocked(data: DockedData): CreateStationParams {
    if (data.StationAllegiance === "Independent") {
      console.log("*********************************************************");
      console.log("*********************************************************");
      console.log("*****                                               *****");
      console.log("*****                 Independent                   *****");
      console.log("*****                                               *****");
      console.log("*********************************************************");
      console.log("*********************************************************");
    }
    return {
      id: data.MarketID,
      stationName: data.StationName,
      distanceFromArrival: data.DistFromStarLS,
      allegiance: data.StationAllegiance || "Independent",
      government: data.StationGovernment,
      stationType: data.StationType,
      landingPads: LandingPadConfig.convertDocked(data),
      stationState: data.StationState || "Neutral",
      system: StarSystem.convertDocked(data),
      stationFaction: StationFaction.convertDocked(data),
      stationEconomies: StationEconomy.convertDocked(data),
      servicesAvailable: data.StationServices,
      createdAt: new Date(data.timestamp),
      updatedAt: new Date(data.timestamp)
    };
  }

  constructor(id: number, stationName: string, distanceFromArrival?: number, timestamp?: Date) {
    this.id = id;
    this.stationName = stationName;
    if (distanceFromArrival) this.distanceFromArrival = distanceFromArrival;
    if (timestamp) {
      this.createdAt = timestamp;
      this.updatedAt = timestamp;
    }
  }
}
