import PendingState from "@api/models/pendingState.model";
import { Service } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class PendingStateRepository extends BaseRepository<PendingState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(PendingState, dataSource);
  }

  public async findOrCreate(
    pendingState: OmitBaseEntity<PendingState>
  ): Promise<PendingState> {
    const { systemFactionId, factionStateId, trend } = pendingState;
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { systemFactionId, factionStateId, trend }
    );
  }

  public async findOneOrCreate(
    systemFactionId: number,
    factionStateId: number,
    trend: number
  ): Promise<PendingState> {
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { systemFactionId, factionStateId, trend }
    );
  }
}
