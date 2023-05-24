import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("planet_compositions")
@Index("body_composition_idx", ["ice", "rock", "metal"])
export default class PlanetComposition extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: "float", nullable: false })
  public ice?: number;
  @Column({ type: "float", nullable: false })
  public rock?: number;
  @Column({ type: "float", nullable: false })
  public metal?: number;
}
