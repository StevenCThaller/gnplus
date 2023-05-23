import Government from "@api/models/government.model";
import { Service, Inject } from "typedi";
import BaseService from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class GovernmentRepository extends BaseService<Government> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: EntityManager | DataSource
  ) {
    super(Government, dataSource);
  }

  public async findOneOrCreate(
    government: string,
    localisedEN?: string,
    localisedEs?: string
  ): Promise<Government> {
    return super._findOneOrCreate(
      { government },
      { government, localisedEN, localisedEs }
    );
  }
}
