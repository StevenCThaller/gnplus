import Allegiance from "@api/models/allegiance";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import ConflictFaction from "@api/models/conflictFaction";

@Service()
export default class ConflictFactionService extends BaseService<ConflictFaction> {
  /**
   *
   */
  constructor(protected dataSource: DataSource | EntityManager) {
    super(ConflictFaction, dataSource);
  }

  // public async findOneOrCreate()
}
