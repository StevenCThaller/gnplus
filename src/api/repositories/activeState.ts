import ActiveState from "@api/models/activeState.model";
import { Service } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class ActiveStateRepository extends BaseRepository<ActiveState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(ActiveState, dataSource);
  }

  public async findOrCreate(
    activeState: OmitBaseEntity<ActiveState>
  ): Promise<ActiveState> {
    const { systemFactionId, factionStateId } = activeState;
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { systemFactionId, factionStateId }
    );
  }

  public async findOneOrCreate(
    systemFactionId: number,
    factionStateId: number
  ): Promise<ActiveState> {
    return super._findOneOrCreate(
      { systemFactionId, factionStateId },
      { systemFactionId, factionStateId }
    );
  }
}
