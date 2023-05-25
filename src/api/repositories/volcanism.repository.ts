import { Volcanism } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class VolcanismRepository extends BaseRepository<Volcanism> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(Volcanism, dataSource);
  }

  public async findOneOrCreate(volcanism: string): Promise<Volcanism> {
    return await super._findOneOrCreate({ volcanism }, { volcanism });
  }
}
