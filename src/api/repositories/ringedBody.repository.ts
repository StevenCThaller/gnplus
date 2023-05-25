import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { ReserveLevel, RingedBody } from "@api/models";

export type RingedBodyParams = {
  bodyId: number;
  systemAddress: number;
  // reserveLevelId?: number;
  // reserveLevel?: ReserveLevel;
};

@Service()
export default class RingedBodyRepository extends BaseRepository<RingedBody> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(RingedBody, dataSource);
  }

  public async findOneOrCreate(params: RingedBodyParams): Promise<RingedBody> {
    const { bodyId, systemAddress } = params;
    const record: RingedBody | null = await this.repository.findOne({
      where: { bodyId, systemAddress }
    });

    if (record) return record;

    // if (params.reserveLevelId) {
    //   createObj.reserveLevelId = params.reserveLevelId;
    //   delete createObj.reserveLevel;
    // } else if (params.reserveLevel) {
    //   createObj.reserveLevel = params.reserveLevel;
    //   delete createObj.reserveLevelId;
    // } else throw "You must provide reserveLevelId or a ReserveLevel record";

    return this.repository.create(params);
  }
}
