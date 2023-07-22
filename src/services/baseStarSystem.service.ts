import { Inject, Service } from "typedi";
import NewQueryService from "./query.service";
import { Logger } from "winston";
import StarSystem from "@models/starSystem.model";
import SystemCoordinates from "@models/systemCoordinates.model";
import { Repository } from "typeorm";

@Service()
export default class BaseStarSystemService {
  constructor(
    @Inject()
    private queryService: NewQueryService,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async findOrInsertBaseStarSystem(params: BaseStarSystemParams): Promise<StarSystem> {
    const repo: Repository<StarSystem> = this.queryService.getRepository(StarSystem);

    let record: StarSystem | null = await repo.findOne({
      where: { systemAddress: params.systemAddress }
    });

    if (record) return record;

    let systemCoordinatesId: number | undefined;
    if (this.systemCoordinatesAreValid(params))
      systemCoordinatesId = await this.findOrInsertSystemCoordinates(params.systemCoordinates);

    record = new StarSystem(
      params.systemAddress,
      params.systemName,
      systemCoordinatesId,
      params.timestamp
    );
    await repo.save(record);

    return record;
  }

  private systemCoordinatesAreValid(params: BaseStarSystemParams): boolean {
    return !(
      params.systemName.toLowerCase() !== "sol" &&
      params.systemCoordinates.x === 0 &&
      params.systemCoordinates.y === 0 &&
      params.systemCoordinates.z === 0
    );
  }

  public async findOrInsertSystemCoordinates(params: SystemCoordinatesParams): Promise<number> {
    const repo: Repository<SystemCoordinates> = this.queryService.getRepository(SystemCoordinates);
    const { x, y, z } = params;
    let record: SystemCoordinates | null = await repo.findOne({ where: { x, y, z } });
    if (record) return record.id as number;

    record = new SystemCoordinates(x, y, z);
    await repo.save(record);

    return record.id as number;
  }
}
