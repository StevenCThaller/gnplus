import { FactionState } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class FactionStateRepository extends BaseRepository<FactionState> {
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
