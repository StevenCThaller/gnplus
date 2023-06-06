import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import Commodity from "./commodity.model";
import Market from "./market.model";
import MarketPrice from "./marketPrice.model";

@Entity("current_market_prices")
@Index("commodity_price_at_market_id", ["commodityId", "marketId"], { unique: true })
export default class CurrentMarketPrice {
  @PrimaryColumn({ name: "commodity_id" })
  public commodityId!: number;
  @ManyToOne(() => Commodity, (commodity) => commodity.currentMarketPrices)
  @JoinColumn({ name: "commodity_id" })
  public commodity?: Commodity;

  @PrimaryColumn({ name: "market_id", type: "bigint", unsigned: true })
  public marketId!: number;
  @ManyToOne(() => Market, (market) => market.currentMarketPrices)
  @JoinColumn({ name: "market_id" })
  public market?: Market;

  @Column({ name: "market_price_id", type: "bigint", unsigned: true })
  public marketPriceId!: number;
  @OneToOne(() => MarketPrice)
  @JoinColumn({ name: "market_price_id" })
  public marketPrice?: MarketPrice;

  @Column({ default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  public timestamp?: Date;
}
