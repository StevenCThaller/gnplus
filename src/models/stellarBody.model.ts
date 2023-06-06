import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import StarType from "./starType.model";
import Luminosity from "./luminosity.model";
import AsteroidBelt from "./asteroidBelt.model";
import CelestialBody from "./celestialBody.model";

@Entity("stellar_bodies")
export default class StellarBody extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "smallint", unsigned: true })
  // @Index()
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  // @Index()
  public systemAddress?: number;

  /**
   * Star measurements
   */
  @Column({ name: "absolute_magnitude", type: "float" })
  public absoluteMagnitude?: number;
  @Column({ name: "age_millions_of_years", type: "int", unsigned: true })
  public ageMY?: number;
  @Column({ name: "stellar_mass", type: "float", unsigned: true })
  public stellarMass?: number;
  @Column({ name: "surface_temperature", type: "float" })
  public surfaceTemperature?: number;
  @Column({ name: "subclass", type: "tinyint" })
  public subclass?: number;

  /**
   * Many to One with Luminosity
   */
  @Column({ name: "luminosity_id", type: "tinyint", nullable: true })
  public luminosityId?: number;
  @ManyToOne(() => Luminosity, (luminosity) => luminosity.stars)
  @JoinColumn({ name: "luminosity_id" })
  public luminosity?: Luminosity;

  /**
   * Many to One with Star Type
   */
  @Column({ name: "star_type_id", type: "tinyint", nullable: true })
  public starTypeId?: number;
  @ManyToOne(() => StarType, (starType) => starType.stars)
  @JoinColumn({ name: "star_type_id" })
  public starType?: StarType;

  @OneToMany(() => AsteroidBelt, (asteroidBelt) => asteroidBelt.star)
  public asteroidBelts?: AsteroidBelt[];

  @OneToOne(() => CelestialBody)
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public body?: CelestialBody;

  public static convertScan(data: StarScanData): StellarBodyParams {
    return {
      absoluteMagnitude: data.AbsoluteMagnitude,
      ageMY: data.Age_MY,
      luminosity: data.Luminosity,
      stellarMass: data.StellarMass,
      subclass: data.Subclass,
      surfaceTemperature: data.SurfaceTemperature,
      starType: data.StarType,
      ...CelestialBody.convertScan(data)
    };
  }
}
