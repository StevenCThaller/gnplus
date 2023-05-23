import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";
import ThargoidWar from "@api/models/thargoidWar.model";
import ThargoidWarState from "@api/models/thargoidWarState.model";

@Service()
export default class ThargoidWarRepository extends BaseRepository<ThargoidWar> {
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
    const record: ThargoidWar | null = await this.repository.findOne({
      where: { systemAddress }
    });
    if (!record) return this.repository.create(thargoidWar);

    record.currentState = thargoidWar.currentState;
    record.estimatedRemainingTime = thargoidWar.estimatedRemainingTime;
    record.nextStateFailure = thargoidWar.nextStateFailure;
    record.nextStateSuccess = thargoidWar.nextStateSuccess;
    record.remainingPorts = thargoidWar.remainingPorts;
    record.successStateReached = thargoidWar.successStateReached;
    record.warProgress = thargoidWar.warProgress;
    await this.repository.save(record);
    this.logger.info("RECORRRRD: %o", record);

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
