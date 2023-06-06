import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import Station from "./station.model";
import ProhibitedItem from "./prohibitedItem.model";
import MarketPrice from "./marketPrice.model";
import CurrentMarketPrice from "./currentMarketPrice.model";

@Entity("markets")
export default class Market {
  @PrimaryColumn({ type: "bigint", unique: true, unsigned: true })
  public id!: number;
  @OneToOne(() => Station, (station) => station.commodityMarket, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "id", referencedColumnName: "id" })
  public station?: Station;

  @OneToMany(() => CurrentMarketPrice, (currentMarketPrice) => currentMarketPrice.market)
  public currentMarketPrices?: CurrentMarketPrice[];

  @OneToMany(() => MarketPrice, (marketPrice) => marketPrice.market)
  public marketPrices?: MarketPrice[];

  @Column({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  public createdAt?: Date;

  @Column({ name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  public updatedAt?: Date;

  @ManyToMany(() => ProhibitedItem, (prohibitedItem) => prohibitedItem.marketsProhibited)
  @JoinTable({
    name: "market_prohibited_items",
    joinColumn: { name: "market_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "prohibited_item_id", referencedColumnName: "id" }
  })
  public prohibitedItems?: ProhibitedItem[];

  constructor(marketId: number, timestamp?: Date) {
    this.id = marketId;
    if (timestamp) {
      this.createdAt = new Date(timestamp);
      this.updatedAt = new Date(timestamp);
    }
  }
}
