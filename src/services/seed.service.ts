import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { DeepPartial, EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { Logger } from "winston";
import fs from "fs";
import path from "path";
import Allegiance from "@models/allegiance.model";
import ConflictStatus from "@models/conflictStatus.model";
import Economy from "@models/economy.model";
import FactionState from "@models/factionState.model";
import Government from "@models/government.model";
import HappinessLevel from "@models/happinessLevel.model";
import StatusFlag from "@models/statusFlag.model";
import BodyType from "@models/bodyType.model";
import ReserveLevel from "@models/reserveLevel.model";

@Service()
export default class SeedService {
  /**
   *
   */
  constructor(
    @Inject()
    private queryService: QueryService,
    @Inject("logger")
    private logger: Logger
  ) {}
  public async seedDatabase(): Promise<void> {
    await this.seedTable(Allegiance, "allegiances.json");
    await this.seedTable(ConflictStatus, "conflict_statuses.json");
    await this.seedTable(Economy, "economies.json");
    await this.seedTable(FactionState, "faction_states.json");
    await this.seedTable(Government, "governments.json");
    await this.seedTable(HappinessLevel, "happiness_levels.json");
    await this.seedTable(StatusFlag, "status_flags.json");
    await this.seedTable(BodyType, "body_types.json");
    await this.seedTable(ReserveLevel, "reserve_levels.json");
  }

  private async seedTable<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    fileName: string
  ): Promise<void> {
    const repo: Repository<T> = this.queryService.getEntityManager().getRepository(entity);
    const existingRecords: T[] = await repo.find();

    fs.readFile(
      path.join(__dirname, "..", "database", "seed", fileName),
      async (err: NodeJS.ErrnoException | null, data: Buffer) => {
        if (err) this.logger.error("WHY? %o", err);

        const seedData = JSON.parse(data.toString());
        const uniqueSeedObjects = seedData.filter(
          (seedObject: DeepPartial<T>): boolean =>
            !existingRecords.some((record: T): boolean => record.id === seedObject.id)
        );

        if (uniqueSeedObjects.length > 0) {
          const records = repo.create(uniqueSeedObjects);
          await repo.save(records);
        }
      }
    );
  }
}
