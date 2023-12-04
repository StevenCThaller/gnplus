import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { Logger } from "winston";
import ShipModule from "@models/shipModule.model";
import { Repository } from "typeorm";

@Service()
export default class OutfittingService {
  private queryService: QueryService;
  private logger: Logger;

  /**
   *
   */
  constructor(@Inject() queryService: QueryService, @Inject("logger") logger: Logger) {
    this.queryService = queryService;
    this.logger = logger;
  }

  public async updateOrCreateShipModules(data: any): Promise<any> {
    return this.queryService.transaction(async (): Promise<void> => {
      const repo: Repository<ShipModule> = this.queryService.getRepository(ShipModule);

      for (const module of data.modules) {
        const moduleRecord: ShipModule | void = await this.findOrCreateShipModule(module);
        if (moduleRecord) {
          await repo.save(moduleRecord);
        }
      }
    });
  }

  private async findOrCreateShipModule(moduleId: string): Promise<ShipModule | void> {
    if (!moduleId) return;

    const shipModule: ShipModule = await this.queryService.findOrCreateEntity(ShipModule, {
      moduleId
    });

    return shipModule;
  }
}
