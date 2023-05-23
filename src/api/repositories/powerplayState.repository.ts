import PowerplayState from "@api/models/powerplayState.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class PowerplayStateRepository extends BaseRepository<PowerplayState> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: EntityManager | DataSource
  ) {
    super(PowerplayState, dataSource);
  }

  public async findByName(
    powerplayState: string
  ): Promise<PowerplayState | null> {
    return this.repository.findOne({ where: { powerplayState } });
  }

  public async findOneOrCreate(
    powerplayState: string
  ): Promise<PowerplayState> {
    return await super._findOneOrCreate({ powerplayState }, { powerplayState });
  }
}
