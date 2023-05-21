import FactionState from "@api/models/factionState";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class FactionStateService extends BaseService<FactionState> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(FactionState, dataSource);
  }

  public async findOneOrCreate(factionState: string): Promise<FactionState> {
    const result = await super._findOneOrCreate(
      { factionState },
      { factionState }
    );
    if (!result.id) await this.repository.save(result);
    return result;
  }
}
