import { RotationParameters } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class RotationParametersRepository extends BaseRepository<RotationParameters> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(RotationParameters, dataSource);
  }

  public async findOneOrCreate(
    bodyId: number,
    systemAddress: number,
    rotationPeriod: number,
    axialTilt: number,
    radius: number
  ): Promise<RotationParameters> {
    return await super._findOneOrCreate(
      { bodyId, systemAddress },
      { bodyId, systemAddress, rotationPeriod, axialTilt, radius }
    );
  }
}
