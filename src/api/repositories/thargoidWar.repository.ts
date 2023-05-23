import { Service, Inject } from "typedi";
import BaseService from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import ThargoidWar from "@api/models/thargoidWar.model";
import ThargoidWarState from "@api/models/thargoidWarState.model";

@Service()
export default class ThargoidWarRepository extends BaseService<ThargoidWar> {
  /**
   *
   */
  constructor(protected dataSource: DataSource | EntityManager) {
    super(ThargoidWar, dataSource);
  }

  public async updateOrCreate(
    thargoidWar: OmitBaseEntity<ThargoidWar>
  ): Promise<ThargoidWar> {
    const { systemAddress } = thargoidWar;
    let record: ThargoidWar | null = await this.repository.findOne({
      where: { systemAddress }
    });
    if (!record) return this.repository.create(thargoidWar);
    record = { ...record, ...thargoidWar } as ThargoidWar;
    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreate(
    systemAddress: number,
    currentStateId: number,
    estimatedRemainingTime: string,
    nextStateFailureId: number,
    nextStateSuccessId: number,
    remainingPorts: number,
    successStateReached: boolean,
    warProgress: number
  ): Promise<ThargoidWar> {
    const record = await super._findOneOrCreate(
      { systemAddress },
      {
        systemAddress,
        currentStateId,
        estimatedRemainingTime,
        nextStateFailureId,
        nextStateSuccessId,
        remainingPorts,
        successStateReached,
        warProgress
      }
    );

    if (!record.id) await this.repository.save(record);

    return record;
  }
}
