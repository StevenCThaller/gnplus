import PowerplayState from "@api/models/powerplayState";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class PowerplayStateService extends BaseService<PowerplayState> {
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
