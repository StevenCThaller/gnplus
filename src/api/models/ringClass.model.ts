import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import Ring from "./ring.model";

@Entity("ring_classes")
export default class RingClass extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "class_name", unique: true, nullable: false })
  public className?: string;

  @OneToMany(() => Ring, (ring) => ring.ringClass)
  public rings?: Ring[];
}
