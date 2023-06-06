import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { Faction, FactionState, StationFaction } from "@models/index";
import { DataSource, EntityManager } from "typeorm";
import FactionService from "./faction.service";
import FactionStateService from "./factionState.service";

@Service()
export default class StationFactionService extends DatabaseService<StationFaction> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, StationFaction);
  }

  public async findOrCreate(stationFaction: StationFactionParams): Promise<StationFaction> {
    try {
      const faction: Faction = await this.getService(FactionService).findOrCreate(
        stationFaction.faction
      );
      let factionState: FactionState | undefined;
      if (stationFaction.factionState)
        factionState = await this.getService(FactionStateService).findOrCreate(
          stationFaction.factionState
        );

      const record: StationFaction = await this.findOrCreateEntity(
        StationFaction,
        { factionId: faction.id, factionStateId: factionState?.id },
        { faction, factionState }
      );

      return record;
    } catch (error) {
      this.logger.error("Error thrown while running StationFactionService.findOrCreate: %o", error);
      throw error;
    }
  }
}
