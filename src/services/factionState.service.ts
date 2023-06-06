import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { FactionState } from "@models/index";
import fs from "fs";
import path from "path";

@Service()
export default class FactionStateService extends DatabaseService<FactionState> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, FactionState);
    this.repository = this.dataSource.getRepository(FactionState);
  }

  public async findOrCreate(factionState: string): Promise<FactionState> {
    try {
      return this.findOrCreateEntity(FactionState, { factionState }, { factionState });
    } catch (error) {
      this.logger.error("Error thrown while running FactionStateService.findOrCreate: %o", error);
      throw error;
    }
  }

  public override async seed(): Promise<void> {
    await super.seed("faction_states.json");
  }
}
