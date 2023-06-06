import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { Economy, SystemEconomy } from "@models/index";
import { DataSource, EntityManager } from "typeorm";
import EconomyService from "./economy.service";

@Service()
export default class SystemEconomyService extends DatabaseService<SystemEconomy> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, SystemEconomy);
    this.repository = this.dataSource.getRepository(SystemEconomy);
  }

  public async findOrCreate(systemEconomy: SystemEconomyParams): Promise<SystemEconomy> {
    const { primaryEconomy: primary, secondaryEconomy: secondary } = systemEconomy;
    const primaryEconomy: Economy = await this.getService(EconomyService).findOrCreate(primary);
    const secondaryEconomy: Economy = await this.getService(EconomyService).findOrCreate(secondary);
    const record: SystemEconomy = await this.findOrCreateEntity(
      SystemEconomy,
      { primaryEconomyId: primaryEconomy.id, secondaryEconomyId: secondaryEconomy.id },
      { primaryEconomy, secondaryEconomy }
    );
    if (!record.hasId()) await this.repository.save(record);
    return record;
  }
}
