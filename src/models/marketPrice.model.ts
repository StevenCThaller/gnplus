import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import Commodity from "./commodity.model";
import Market from "./market.model";

@Entity("market_prices")
@Index("market_price_idx", ["commodityId", "marketId"], { unique: false })
export default class MarketPrice extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id!: number;

  @Column({ name: "commodity_id" })
  @Index()
  public commodityId!: number;
  @ManyToOne(() => Commodity, (commodity) => commodity.marketPrices)
  @JoinColumn({ name: "commodity_id" })
  public commodity?: Commodity;

  @Column({ name: "market_id", type: "bigint", unsigned: true })
  @Index()
  public marketId!: number;
  @ManyToOne(() => Market, (market) => market.marketPrices)
  @JoinColumn({ name: "market_id" })
  public market?: Market;

  /**
   * Buying from Market
   */
  @Column({ name: "buy_price" })
  public buyPrice!: number;
  @Column()
  public supply!: number;
  @Column({ name: "supply_bracket" })
  public supplyBracket!: number;

  /**
   * Selling to Market
   */
  @Column({ name: "sell_price" })
  public sellPrice!: number;
  @Column()
  public demand!: number;
  @Column({ name: "demand_bracket" })
  public demandBracket!: number;

  /**
   * Galactic Average Price
   */
  @Column({ name: "mean_price" })
  public meanPrice!: number;

  @Column({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  @Index()
  public createdAt?: Date;
}
