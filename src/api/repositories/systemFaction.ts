import SystemFaction from "@api/models/systemFaction.model";
import { Service } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import FactionState from "@api/models/factionState.model";
import Faction from "@api/models/faction.model";
import HappinessLevel from "@api/models/happiness.model";

@Service()
export default class SystemFactionRepository extends BaseService<SystemFaction> {
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
    return super._findOneOrCreate({ systemAddress }, systemFaction);
  }

  public async findOneOrCreate(
    systemAddress: number,
    allegiance: Allegiance,
    government: Government,
    happiness: HappinessLevel,
    faction: Faction,
    factionState: FactionState
  ): Promise<SystemFaction> {
    return super._findOneOrCreate(
      { systemAddress, faction },
      {
        systemAddress,
        allegiance,
        government,
        happiness,
        factionState,
        faction
      }
    );
  }
}
