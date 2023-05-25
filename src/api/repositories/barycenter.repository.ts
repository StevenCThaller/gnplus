import { Barycenter } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class BarycenterRepository extends BaseRepository<Barycenter> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(Barycenter, dataSource);
  }

  public async findOneOrCreate(
    bodyId: number,
    systemAddress: number,
    ascendingNode: number,
    meanAnomaly: number
  ): Promise<Barycenter> {
    return await super._findOneOrCreate(
      { bodyId, systemAddress },
      { bodyId, systemAddress, ascendingNode, meanAnomaly }
    );
  }
}
