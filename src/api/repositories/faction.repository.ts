import Faction from "@api/models/faction.model";
import { Service, Inject } from "typedi";
import BaseService from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class FactionRepository extends BaseService<Faction> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Faction, dataSource);
  }

  public async findOneOrCreate(factionName: string): Promise<Faction> {
    const result = await super._findOneOrCreate(
      { factionName },
      { factionName }
    );
    if (!result.id) await this.repository.save(result);
    return result;
  }
}
