import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import Market from "./market.model";

@Entity("prohibited_items")
export default class ProhibitedItem extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  public id?: number;

  @Column({ name: "item_name", nullable: false, unique: true })
  public itemName?: string;

  @ManyToMany(() => Market, (market) => market.prohibitedItems)
  public marketsProhibited?: Market[];
}
