import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import RingedBody from "./ringedBody.model";

@Entity("reserve_levels")
export default class ReserveLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "reserve_level", unique: true, nullable: false })
  public reserveLevel?: string;

  @Column({ name: "localised_en", nullable: true })
  public localisedEN?: string;

  @Column({ name: "localised_es", nullable: true })
  public localisedES?: string;

  @OneToMany(() => RingedBody, (ringedBody) => ringedBody.reserves)
  public ringedBodies?: RingedBody[];
}
