import { Entity, ManyToOne, Column, JoinColumn, BaseEntity, PrimaryGeneratedColumn } from "typeorm";
import Station from "./station.model";
import Economy from "./economy.model";

@Entity("station_economies")
export default class StationEconomy {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "station_id", unsigned: true, nullable: true })
  public stationId?: number;

  @Column({ name: "economy_id", nullable: true })
  public economyId?: number;

  @ManyToOne(() => Station, (station) => station.stationEconomies)
  @JoinColumn({ name: "station_id" })
  public station?: Station;

  @ManyToOne(() => Economy, (economy) => economy.stations)
  @JoinColumn({ name: "economy_id" })
  public economy?: Economy;

  @Column({ nullable: false, type: "float" })
  public proportion?: number;

  constructor(stationId: number, economyId: number, proportion: number) {
    this.stationId = stationId;
    this.economyId = economyId;
    this.proportion = proportion;
  }

  public static convertDocked(data: DockedData): StationEconomyParams[] {
    const economies = data.StationEconomies;
    if (!Array.isArray(economies)) {
      return [
        {
          economy: data.StationEconomy,
          proportion: 1
        }
      ];
    }

    return economies.map(
      (stationEconomy: DockedStationEconomy): StationEconomyParams => ({
        economy: stationEconomy.Name,
        proportion: stationEconomy.Proportion
      })
    );
  }
}
