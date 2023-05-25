import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import StarType from "./starType.model";
import Luminosity from "./luminosity.model";

@Entity("stellar_bodies")
export default class StellarBody extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Star measurements
   */
  @Column({ name: "absolute_magnitude", type: "float", unsigned: true })
  public absoluteMangitude?: number;
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
  @Column({ name: "luminosity_id", type: "tinyint" })
  public luminosityId?: number;
  @ManyToOne(() => Luminosity, (luminosity) => luminosity.stars)
  @JoinColumn({ name: "luminosity_id" })
  public luminosity?: Luminosity;

  /**
   * Many to One with Star Type
   */
  @Column({ name: "star_type_id", type: "tinyint" })
  public starTypeId?: number;
  @ManyToOne(() => StarType, (starType) => starType.stars)
  @JoinColumn({ name: "star_type_id" })
  public starType?: StarType;
}
