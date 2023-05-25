import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import SecurityLevel from "@api/models/securityLevel.model";

@Service()
export default class SecurityLevelRepository extends BaseRepository<SecurityLevel> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SecurityLevel, dataSource);
  }

  public async findOneOrCreate(securityLevel: string): Promise<SecurityLevel> {
    return super._findOneOrCreate({ securityLevel }, { securityLevel });
  }
}
