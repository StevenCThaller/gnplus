import StarSystem from "@api/models/starSystem";
import { Service, Inject } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class FSDJumpService {
  private manager?: EntityManager;

  constructor(
    @Inject("dataSource")
    private readonly dataSource: DataSource,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async handleFSDJumpEvent(data: FSDJumpData): Promise<void> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      this.manager = manager;
    });
  }

  // private async findOrCreateSystem(data: FSDJumpData): Promise<StarSystem> {

  // }
}
