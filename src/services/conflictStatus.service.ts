import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import { ConflictStatus } from "@models/index";

@Service()
export default class ConflictStatusService extends DatabaseService<ConflictStatus> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, ConflictStatus);
    this.repository = this.dataSource.getRepository(ConflictStatus);
  }

  public async findOrCreate(conflictStatus: string): Promise<ConflictStatus> {
    return this.findOrCreateEntity(ConflictStatus, { conflictStatus });
  }

  public override async seed(): Promise<void> {
    await super.seed("conflict_statuses.json");
  }
}
