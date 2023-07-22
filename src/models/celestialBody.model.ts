import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import StarSystem from "./starSystem.model";
import BodyType from "./bodyType.model";
import Orbit from "./orbit.model";
import Barycenter from "./barycenter.model";
import RotationParameters from "./rotationParameters.model";
import Ring from "./ring.model";
import RingedBody from "./ringedBody.model";

@Entity("celestial_bodies")
@Index("celestial_body_id", ["bodyId", "systemAddress"], { unique: true })
export default class CelestialBody {
  /**
   * Composite Primary key
   */
  @PrimaryColumn({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.bodies, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;

  @Column({ name: "body_name", unique: true, nullable: true })
  public bodyName?: string;

  @Column({ name: "distance_from_arrival", type: "float", nullable: true })
  public distanceFromArrival?: number;

  /**
   * Many to One with Body Type
   */
  @Column({ name: "body_type_id", nullable: true })
  public bodyTypeId?: number;
  @ManyToOne(() => BodyType, (bodyType) => bodyType.bodiesWithType)
  @JoinColumn({ name: "body_type_id" })
  public bodyType?: BodyType;

  /**
   * Optional One to One with Orbit - this body's orbit
   */
  @Column({ name: "orbit_id", nullable: true, type: "bigint", unsigned: true })
  public orbitId?: number;
  @OneToOne(() => Orbit, (orbit) => orbit.body, { cascade: ["insert"] })
  @JoinColumn({ name: "orbit_id" })
  public orbit?: Orbit;

  /**
   * Many to One with Celestial Body - the body
   * around which this orbit describes
   */
  @Column({ name: "parent_body_id", nullable: true })
  public parentBodyId?: number;
  @ManyToOne(() => CelestialBody, (celestialBody) => celestialBody.bodiesOrbitingThisBody, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({
    name: "parent_body_id",
    referencedColumnName: "bodyId"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
  })
  public parentBody?: CelestialBody;

  @OneToMany(() => CelestialBody, (celestialBody) => celestialBody.parentBody)
  public bodiesOrbitingThisBody?: CelestialBody[];

  /**
   * Many to One with Barycenter -> the barycenter around which this
   * body orbits
   */
  @Column({ name: "barycenter_id", nullable: true })
  public barycenterId?: number;
  @ManyToOne(() => Barycenter, (barycenter) => barycenter.bodies, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "barycenter_id" })
  public barycenter?: Barycenter;

  /**
   * One to One with Rotational Parameters -> the rotation parameters
   * that describe the rotation of this body
   */
  @OneToOne(() => RotationParameters, (rotationParameters) => rotationParameters.body, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  public rotationParameters?: RotationParameters;

  @OneToOne(() => RingedBody, (ringedBody) => ringedBody.celestialBody)
  public ringedBody?: RingedBody;

  /**
   * Timestamps
   */
  @Column({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;

  public static convertScan(data: ScanData): CelestialBodyParams {
    return {
      bodyId: data.BodyID,
      system: StarSystem.convertScan(data),
      bodyName: data.BodyName,
      distanceFromArrival: data.DistanceFromArrivalLS,
      bodyType: data.StarType
        ? "Star"
        : data.PlanetClass
        ? "Planet"
        : data.BodyName.includes("Belt")
        ? "AsteroidBelt"
        : "Ring",
      parentBodyId: data.Parents ? Object.values(data.Parents[0])[0] : undefined,
      orbit: data.SemiMajorAxis ? Orbit.convertScan(data) : undefined,
      barycenter: data.AscendingNode ? Barycenter.convertScan(data) : undefined,
      rings: data.Rings ? Ring.convertScan(data) : undefined,
      rotationParams: data.AxialTilt ? RotationParameters.convertScan(data) : undefined
    };
  }

  public static convertScanBarycentre(data: ScanBarycentreData): CelestialBodyParams {
    return {
      bodyId: data.BodyID,
      system: StarSystem.convertScanBarycenter(data),
      orbit: Orbit.convertScanBarycenter(data),
      barycenter: Barycenter.convertScanBarycenter(data),
      createdAt: new Date(data.timestamp),
      updatedAt: new Date(data.timestamp)
    };
  }

  public static createFromScan(scanData: ScanData, bodyTypeId: number): CelestialBody {
    return new CelestialBody(
      scanData.BodyID,
      scanData.SystemAddress,
      scanData.BodyName,
      scanData.DistanceFromArrivalLS,
      bodyTypeId,
      scanData.timestamp
    );
  }

  constructor(
    bodyId: number,
    systemAddress: number,
    bodyName: string,
    distanceFromArrival: number,
    bodyTypeId: number,
    timestamp: string
  ) {
    this.bodyId = bodyId;
    this.systemAddress = systemAddress;
    this.bodyName = bodyName;
    this.distanceFromArrival = distanceFromArrival;
    this.bodyTypeId = bodyTypeId;
    this.createdAt = new Date(timestamp);
    this.updatedAt = new Date(timestamp);
  }
}
