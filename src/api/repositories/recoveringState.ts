import RecoveringState from "@api/models/recoveringState.model";
import { Service } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import Allegiance from "@api/models/allegiance.model";
import Government from "@api/models/government.model";
import FactionState from "@api/models/factionState.model";
import Faction from "@api/models/faction.model";
import HappinessLevel from "@api/models/happiness.model";

@Service()
export default class RecoveringStateRepository extends BaseService<RecoveringState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(RecoveringState, dataSource);
  }

  public async findOrCreate(
    recoveringState: OmitBaseEntity<RecoveringState>
  ): Promise<RecoveringState> {
    const { factionState, trend } = recoveringState;
    return super._findOneOrCreate(
      { factionState: factionState?.id, trend },
      { factionState, trend }
    );
  }

  public async findOneOrCreate(
    systemFactionId: number,
    factionState: FactionState,
    trend: number
  ): Promise<RecoveringState> {
    return super._findOneOrCreate(
      { systemFactionId, factionState },
      { systemFactionId, factionState, trend }
    );
  }
}
