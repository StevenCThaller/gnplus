import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseService from ".";
import SecurityLevel from "@api/models/securityLevel";

@Service()
export default class SecurityLevelService extends BaseService<SecurityLevel> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SecurityLevel, dataSource);
  }

  public async findOneOrCreate(securityLevel: string): Promise<SecurityLevel> {
    return super._findOneOrCreate({ securityLevel }, { securityLevel });
  }
}
