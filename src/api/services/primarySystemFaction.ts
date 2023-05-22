import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseService from ".";
import PrimarySystemFaction from "@api/models/primarySystemFaction";
import Faction from "@api/models/faction";
import FactionState from "@api/models/factionState";

@Service()
export default class PrimarySystemFactionService extends BaseService<PrimarySystemFaction> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(PrimarySystemFaction, dataSource);
  }

  public async findOneAndUpdate(
    systemAddress: number,
    faction: Faction,
    factionState?: FactionState
  ): Promise<PrimarySystemFaction | undefined> {
    const record = await this.repository.findOne({ where: { systemAddress } });
    if (!record) return;

    record.faction = faction;
    record.factionState = factionState;

    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreate(
    systemAddress: number,
    faction: Faction,
    factionState?: FactionState,
    id?: number
  ): Promise<PrimarySystemFaction> {
    return super._findOneOrCreate(id ? { id } : { systemAddress }, {
      systemAddress,
      faction,
      factionState
    });
  }
}
