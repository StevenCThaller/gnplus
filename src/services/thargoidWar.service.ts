import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { ThargoidWar, ThargoidWarState } from "@models/index";

@Service()
export default class ThargoidWarService extends DatabaseService<ThargoidWar> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, ThargoidWar);
    this.repository = this.dataSource.getRepository(ThargoidWar);
  }

  public async findOrCreate(params: ThargoidWarParams): Promise<ThargoidWar> {
    try {
      let thargoidWar: ThargoidWar | null = await this.repository.findOne({
        where: { systemAddress: params.systemAddress }
      });

      if (!thargoidWar) {
        thargoidWar = this.repository.create({
          systemAddress: params.systemAddress,
          remainingPorts: params.remainingPorts,
          warProgress: params.warProgress,
          estimatedRemainingTime: params.estimatedRemainingTime || "Unknown",
          successStateReached: params.successStateReached ?? false,
          createdAt: params.createdAt,
          updatedAt: params.updatedAt
        });
      } else {
        thargoidWar.updatedAt = params.updatedAt;
      }

      await Promise.all([
        this.upsertWarStates(
          thargoidWar,
          params.currentState,
          params.nextStateFailure,
          params.nextStateSuccess
        )
      ]);
      // await this.dataSource
      //   .getRepository(ThargoidWarState)
      //   .save([
      //     thargoidWar.currentState as ThargoidWarState,
      //     thargoidWar.nextStateFailure as ThargoidWarState,
      //     thargoidWar.nextStateSuccess as ThargoidWarState
      //   ]);

      await this.repository.save(thargoidWar);
      return thargoidWar;
    } catch (error) {
      this.logger.error("Error thrown while running ThargoidWarService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertWarStates(
    war: ThargoidWar,
    currentState: string,
    nextStateFailure: string,
    nextStateSuccess: string
  ): Promise<void> {
    const setOfStates = new Set();
    setOfStates.add(currentState);
    setOfStates.add(nextStateFailure);
    setOfStates.add(nextStateSuccess);

    const recordTable: { [key: string]: ThargoidWarState } = {};

    if (!recordTable[currentState])
      recordTable[currentState] = await this.findOrCreateEntity(ThargoidWarState, {
        warState: currentState || "Unknown"
      });
    war.currentState = recordTable[currentState];

    if (!recordTable[nextStateFailure])
      recordTable[nextStateFailure] = await this.findOrCreateEntity(ThargoidWarState, {
        warState: nextStateFailure || "Unknown"
      });
    war.nextStateFailure = recordTable[nextStateFailure];

    if (!recordTable[nextStateFailure])
      recordTable[nextStateSuccess] = await this.findOrCreateEntity(ThargoidWarState, {
        warState: nextStateSuccess || "Unknown"
      });

    war.nextStateSuccess = recordTable[nextStateSuccess];
  }

  private async upsertCurrentState(war: ThargoidWar, warState?: string): Promise<void> {
    if (warState) {
      war.currentState = await this.findOrCreateEntity(ThargoidWarState, { warState }, false);
    }
  }

  private async upsertNextStateFailure(war: ThargoidWar, warState?: string): Promise<void> {
    if (warState) {
      war.nextStateFailure = await this.findOrCreateEntity(ThargoidWarState, { warState }, false);
    }
  }
  private async upsertNextStateSuccess(war: ThargoidWar, warState?: string): Promise<void> {
    if (warState) {
      war.nextStateSuccess = await this.findOrCreateEntity(ThargoidWarState, { warState }, false);
    }
  }
}
