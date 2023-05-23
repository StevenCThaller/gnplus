import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseService from "./base.repository";
import SecurityLevel from "@api/models/securityLevel.model";

@Service()
export default class SecurityLevelRepository extends BaseService<SecurityLevel> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SecurityLevel, dataSource);
  }

  public async findOneOrCreate(securityLevel: string): Promise<SecurityLevel> {
    return super._findOneOrCreate({ securityLevel }, { securityLevel });
  }
}
