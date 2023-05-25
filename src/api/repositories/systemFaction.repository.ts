import SystemFaction from "@api/models/systemFaction.model";
import { Service } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import FactionState from "@api/models/factionState.model";
import Faction from "@api/models/faction.model";

@Service()
export default class SystemFactionRepository extends BaseRepository<SystemFaction> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SystemFaction, dataSource);
  }

  public async findOrCreate(
    systemFaction: OmitBaseEntity<SystemFaction>
  ): Promise<SystemFaction> {
    const { systemAddress } = systemFaction;
    // this.logger.info("INcoming SYstem Faction: %o", systemFaction);
    return super._findOneOrCreate({ systemAddress }, systemFaction);
  }
}
