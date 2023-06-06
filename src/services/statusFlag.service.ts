import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import StatusFlag from "@models/statusFlag.model";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class StatusFlagService extends DatabaseService<StatusFlag> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, StatusFlag);
    this.repository = this.dataSource.getRepository(StatusFlag);
  }

  public async findOrCreateMultiple(flags: string[]): Promise<StatusFlag[]> {
    return Promise.all(flags.map((flag: string): Promise<StatusFlag> => this.findOrCreate(flag)));
  }

  public async findOrCreate(flag: string): Promise<StatusFlag> {
    try {
      let flagRecord: StatusFlag | null = await this.repository.findOne({ where: { flag } });

      if (!flagRecord) {
        flagRecord = this.repository.create({ flag });
        await this.repository.save(flagRecord);
      }

      return flagRecord;
    } catch (error) {
      this.logger.error("Error thrown while running StatusFlagService.findOrCreate: %o", error);
      throw error;
    }
  }

  public override async seed(): Promise<void> {
    await super.seed("status_flags.json");
  }
}
