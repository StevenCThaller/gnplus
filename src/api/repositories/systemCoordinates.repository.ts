import SystemCoordinates from "@api/models/systemCoordinates.model";
import { Service, Inject } from "typedi";
import BaseRepository from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class SystemCoordinatesRepository extends BaseRepository<SystemCoordinates> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(SystemCoordinates, dataSource);
  }

  public async findOneOrCreate(
    x: number,
    y: number,
    z: number
  ): Promise<SystemCoordinates> {
    return super._findOneOrCreate({ x, y, z }, { x, y, z });
  }
}
