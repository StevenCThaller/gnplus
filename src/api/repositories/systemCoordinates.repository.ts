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

    // return (await this.repository.createQueryBuilder().insert().into(SystemCoordinates).values({x, y, z}).execute()
  }

  public async findOrCreateRunQueryBuilder(
    x: number,
    y: number,
    z: number
  ): Promise<any> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(SystemCoordinates)
      .values({ x, y, z })
      .execute();

    return this.repository.findOne({ where: { x, y, z } });
  }
}
