import RecoveringState from "@api/models/recoveringState.model";
import { Service } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import FactionState from "@api/models/factionState.model";

@Service()
export default class RecoveringStateRepository extends BaseRepository<RecoveringState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(RecoveringState, dataSource);
  }

  public async findOrCreate(
    recoveringState: OmitBaseEntity<RecoveringState>
  ): Promise<RecoveringState> {
    const { systemFactionId, factionStateId, trend } = recoveringState;
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { factionStateId, trend }
    );
  }

  public async findOneOrCreate(
    systemFactionId: number,
    factionStateId: number,
    trend: number
  ): Promise<RecoveringState> {
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { systemFactionId, factionStateId, trend }
    );
  }
}
