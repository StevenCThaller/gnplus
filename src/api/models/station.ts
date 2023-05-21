import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  ManyToMany,
  OneToOne,
  JoinTable,
  JoinColumn,
  BaseEntity,
  OneToMany
} from "typeorm";
import Allegiance from "./allegiance";
import StationType from "./stationType";
import LandingPadConfig from "./landingPadConfig";
import ServiceOffered from "./serviceOffered";
import Government from "./government";
import StationState from "./stationState";
import StarSystem from "./starSystem";
import StationFaction from "./stationFaction";
import StationEconomy from "./stationEconomy";
// import StationRepository from "@api/repositories/station";

@Entity("stations")
export default class Station extends BaseEntity {
  @PrimaryColumn({
    name: "market_id",
    unsigned: true
  })
  // @Column({ name: "market_id", unsigned: true })
  public marketId!: number;

  @Column({ name: "station_name", nullable: false })
  public stationName!: string;

  @Column({ name: "distance_from_arrival", type: "float" })
  public distanceFromArrival!: number;

  /**
   * Timestamps
   */
  @Column({ name: "created_at", nullable: false })
  public createdAt!: Date;

  @Column({
    name: "updated_at",
    nullable: false,
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt!: Date;

  /**
   * Many to One Relationships
   */

  @ManyToOne(() => Allegiance, (allegiance) => allegiance.stations, {
    cascade: ["insert"],
    nullable: true
  })
  @JoinColumn({ name: "allegiance_id" })
  public allegiance?: Allegiance;

  @ManyToOne(() => Government, (government) => government.stations)
  @JoinColumn({ name: "government_id" })
  public government!: Government;

  @ManyToOne(
    () => StationType,
    (stationType) => stationType.stationsWithThisType,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "station_type_id" })
  public stationType!: StationType;

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

  @ManyToOne(
    () => StationState,
    (stationState) => stationState.stationsWithThisState,
    { cascade: ["insert"] }
  )
  @JoinColumn({ name: "station_state_id" })
  public stationState?: StationState;

  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress!: number;

  @ManyToOne(() => StarSystem, (starSystem) => starSystem.stationsInSystem, {
    cascade: ["insert"]
  })
  @JoinColumn({ name: "system_address" })
  public starSystem!: StarSystem;

  @OneToOne(() => StationFaction, (stationFaction) => stationFaction.station)
  @JoinColumn({ name: "station_faction_id" })
  public stationFaction!: StationFaction;

  /**
   * Many to Many Relationships
   */
  @OneToMany(() => StationEconomy, (stationEconomy) => stationEconomy.station, {
    cascade: ["insert"]
  })
  public stationEconomies!: StationEconomy[];

  @ManyToMany(
    () => ServiceOffered,
    (service) => service.stationsOfferingThisService,
    { cascade: ["insert"] }
  )
  @JoinTable({
    name: "station_has_services",
    joinColumn: { name: "station_id", referencedColumnName: "marketId" },
    inverseJoinColumn: { name: "service_id", referencedColumnName: "id" }
  })
  public servicesAvailable!: ServiceOffered[];
}
