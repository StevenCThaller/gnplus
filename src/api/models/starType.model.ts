import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import StarTypeCategory from "./starTypeCategory.model";
import StellarBody from "./stellarBody.model";

@Entity("star_types")
export default class StarType extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint" })
  public id?: number;

  @Column({ name: "label", unique: true })
  public label?: string;

  @Column({ name: "scoopable" })
  public scoopable?: boolean;

  @Column({
    name: "category_id",
    type: "tinyint",
    foreignKeyConstraintName: "star_type_category_fk"
  })
  public categoryId?: number;
  @ManyToOne(
    () => StarTypeCategory,
    (starTypeCategory) => starTypeCategory.starTypes,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({ name: "category_id" })
  public category?: StarTypeCategory;

  @OneToMany(() => StellarBody, (stellarBody) => stellarBody.starType)
  public stars?: StellarBody[];
}
