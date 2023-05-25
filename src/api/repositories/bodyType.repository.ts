import { BodyType } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class BodyTypeRepository extends BaseRepository<BodyType> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(BodyType, dataSource);
  }

  public async findOneOrCreate(bodyType: string): Promise<BodyType> {
    return await super._findOneOrCreate({ bodyType }, { bodyType });
  }
}
