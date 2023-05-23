import PendingState from "@api/models/pendingState.model";
import { Service } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import FactionState from "@api/models/factionState.model";
import Faction from "@api/models/faction.model";
import HappinessLevel from "@api/models/happiness.model";

@Service()
export default class PendingStateRepository extends BaseService<PendingState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(PendingState, dataSource);
  }

  public async findOrCreate(
    pendingState: OmitBaseEntity<PendingState>
  ): Promise<PendingState> {
    const { factionState, trend } = pendingState;
    return super._findOneOrCreate(
      { factionStateId: factionState!.id, trend },
      { factionState, trend }
    );
  }

  public async findOneOrCreate(
    systemFactionId: number,
    factionState: FactionState,
    trend: number
  ): Promise<PendingState> {
    return super._findOneOrCreate(
      { systemFactionId, factionState },
      { systemFactionId, factionState, trend }
    );
  }
}
