import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Government } from "@models/index";

@Service()
export default class GovernmentService {
  private repository: Repository<Government>;
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    // super(dataSource, Government);
    this.repository = this.dataSource.getRepository(Government);
  }

  public async findOrCreate(government: string): Promise<void> {
    // return this.findOrCreateEntity(Government, { government }, { government });
  }

  public async seed(): Promise<void> {
    // await super.seed("governments.json");
  }
}
