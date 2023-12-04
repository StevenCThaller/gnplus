import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { Logger } from "winston";
import { Repository } from "typeorm";
import PlanetaryBody from "@models/planetaryBody.model";

@Service()
export default class FSSScanService {
  constructor(
    @Inject()
    private queryService: QueryService,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async scanFSSBodySignals(data: any): Promise<void> {
    return this.queryService.transaction(async () => {
      const repo: Repository<PlanetaryBody> = this.queryService.getRepository(PlanetaryBody);
    });
  }

  // private async findOrCreatePlanetaryBodyBasic(planetData: any): Promise<PlanetaryBody> {
  //   const { bodyId, systemAddress } = planetData;
  // }
}
