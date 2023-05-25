import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import StarType from "./starType.model";

@Entity("star_type_categories")
export default class StarTypeCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "category", unique: true, nullable: false })
  public category?: string;

  @OneToMany(() => StarType, (starType) => starType.category)
  public starTypes?: StarType[];
}
