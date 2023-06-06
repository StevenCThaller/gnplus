import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import StellarBody from "./stellarBody.model";

@Entity("luminosities")
export default class Luminosity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint" })
  public id?: number;

  @Column({ unique: true, nullable: false })
  public luminosity?: string;

  @OneToMany(() => StellarBody, (stellarBody) => stellarBody.luminosity)
  public stars?: StellarBody[];
}
