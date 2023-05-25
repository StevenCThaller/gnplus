import { TerraformState } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class TerraformStateRepository extends BaseRepository<TerraformState> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(TerraformState, dataSource);
  }

  public async findOneOrCreate(
    terraformState: string
  ): Promise<TerraformState> {
    return await super._findOneOrCreate({ terraformState }, { terraformState });
  }
}
