import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import Commodity from "./commodity.model";

@Entity("status_flags")
export default class StatusFlag extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  public id?: number;

  @Column({ name: "flag", nullable: false, unique: true })
  public flag!: string;

  @ManyToMany(() => Commodity, (commodity) => commodity.statusFlags)
  public commodities?: Commodity[];

  public static getCommodityStatusFlags(data: CommodityParams[]): string[] {
    const flags: string[] = data.reduce((flags: string[], commodity: CommodityParams): string[] => {
      if (!commodity.statusFlags) return flags;
      return [...flags, ...commodity.statusFlags];
    }, []);

    const flagSet = new Set(flags);
    return Array.from(flagSet);
  }
}
