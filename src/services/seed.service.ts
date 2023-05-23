import { Service, Inject } from "typedi";
import { DataSource } from "typeorm";

@Service()
export default class SeedService {
  constructor(
    @Inject("dataSource")
    private dataSource: DataSource
  ) {}

  public async Seed() {}
}
