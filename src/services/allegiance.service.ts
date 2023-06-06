import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Allegiance } from "@models/index";

@Service()
export default class AllegianceService {
  private repository: Repository<Allegiance>;
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    // super(dataSource, Allegiance);
    this.repository = this.dataSource.getRepository(Allegiance);
  }

  public async findOrCreate(allegiance: string): Promise<void> {
    // return this.findOrCreateEntity(Allegiance, { allegiance }, { allegiance });
  }

  public async seed(): Promise<void> {
    // await super.seed("allegiances.json");
  }
}
