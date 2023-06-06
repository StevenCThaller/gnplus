import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planet_classes")
export default class PlanetClass extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "class_name", unique: true, nullable: false })
  public className?: string;

  @OneToMany(() => PlanetaryBody, (planetaryBody) => planetaryBody.planetClass)
  public planets?: PlanetaryBody[];
}
