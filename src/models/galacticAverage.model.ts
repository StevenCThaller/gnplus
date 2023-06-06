import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import Commodity from "./commodity.model";

@Entity("galactic_averages")
export default class GalacticAverage {
  @PrimaryColumn({ name: "commodity_id", unique: true })
  public commodityId!: number;
  @OneToOne(() => Commodity)
  public commodity?: Commodity;

  @Column({ name: "mean_price" })
  public meanPrice!: number;

  @Column({ default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  public timestamp?: Date;
}
