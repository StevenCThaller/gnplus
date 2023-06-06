import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import Station from "./station.model";

@Entity("landing_pad_configurations")
@Index(["small", "medium", "large"])
export default class LandingPadConfig {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ nullable: false })
  public small!: number;

  @Column({ nullable: false })
  public medium!: number;

  @Column({ nullable: false })
  public large!: number;

  @OneToMany(() => Station, (station) => station.landingPads)
  public stationsWithThisConfiguration?: Station[];

  public static convertDocked(data: DockedData): LandingPadsParams | undefined {
    if (data.LandingPads) {
      const { Small, Medium, Large } = data.LandingPads;
      return {
        small: Small,
        medium: Medium,
        large: Large
      };
    }
  }

  constructor(small: number, medium: number, large: number) {
    this.small = small;
    this.medium = medium;
    this.large = large;
  }
}
