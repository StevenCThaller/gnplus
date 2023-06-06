import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import StatusFlag from "./statusFlag.model";
import MarketPrice from "./marketPrice.model";
import CurrentMarketPrice from "./currentMarketPrice.model";

@Entity("commodities")
export default class Commodity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "commodity", unique: true, nullable: false })
  public commodity!: string;

  @Column({ name: "localised_en", nullable: true })
  public localisedEN?: string;

  @OneToMany(() => MarketPrice, (marketPrice) => marketPrice.commodity)
  public marketPrices!: MarketPrice[];

  @ManyToMany(() => StatusFlag, (statusFlag) => statusFlag.commodities)
  @JoinTable({
    name: "commodity_status_flags",
    joinColumn: { name: "commodity_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "status_flag_id", referencedColumnName: "id" }
  })
  public statusFlags!: StatusFlag[];

  @OneToMany(() => CurrentMarketPrice, (currentMarketPrice) => currentMarketPrice.commodity)
  public currentMarketPrices?: CurrentMarketPrice[];

  constructor(commodity: string) {
    this.commodity = commodity;
  }

  public static convertCommodityEvent(data: CommodityData): CommodityParams {
    return {
      commodity: data.name,
      statusFlags: data.statusFlags
    };
  }
}
