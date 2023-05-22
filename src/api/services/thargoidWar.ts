import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import ThargoidWar from "@api/models/thargoidWar";
import ThargoidWarState from "@api/models/thargoidWarState";

@Service()
export default class ThargoidWarService extends BaseService<ThargoidWar> {
  /**
   *
   */
  constructor(protected dataSource: DataSource | EntityManager) {
    super(ThargoidWar, dataSource);
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
    this.logger.info("ALL THE THINGS: %s", successStateReached);
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
