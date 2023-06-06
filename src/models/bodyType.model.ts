import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany
} from "typeorm";
import CelestialBody from "./celestialBody.model";

@Entity("body_types")
export default class BodyType extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "body_type", unique: true, nullable: false })
  public bodyType?: string;

  @OneToMany(() => CelestialBody, (celestialBody) => celestialBody.bodyType)
  public bodiesWithType?: CelestialBody[];
}
