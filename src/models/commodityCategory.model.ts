import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToMany } from "typeorm";
import Commodity from "./commodity.model";

@Entity("commodity_categories")
export default class CommodityCategory {
  @PrimaryGeneratedColumn()
  public id!: number;

  @PrimaryColumn({
    name: "category_name",
    unique: true,
    nullable: false
  })
  public categoryName!: string;

  @OneToMany(() => Commodity, (commodity) => commodity.category)
  public commodities?: Commodity[];
}
