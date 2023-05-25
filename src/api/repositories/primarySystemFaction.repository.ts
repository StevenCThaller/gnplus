import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import PrimarySystemFaction from "@api/models/primarySystemFaction.model";
import Faction from "@api/models/faction.model";
import FactionState from "@api/models/factionState.model";

@Service()
export default class PrimarySystemFactionRepository extends BaseRepository<PrimarySystemFaction> {
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

  public async findOrCreate(
    primarySystemFaction: OmitBaseEntity<PrimarySystemFaction>
  ): Promise<PrimarySystemFaction> {
    const { systemAddress, faction, factionState } = primarySystemFaction;
    return super._findOneOrCreate(
      { systemAddress },
      { systemAddress, faction, factionState }
    );
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
