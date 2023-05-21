import {
  Column,
  Entity,
  Index,
  OneToMany,
  Unique,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import Station from "./station";

@Entity("landing_pad_configurations")
@Index(["small", "medium", "large"])
export default class LandingPadConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ nullable: false })
  public small!: number;

  @Column({ nullable: false })
  public medium!: number;

  @Column({ nullable: false })
  public large!: number;

  @OneToMany((type) => Station, (station) => station.landingPads)
  public stationsWithThisConfiguration!: Station[];
}
