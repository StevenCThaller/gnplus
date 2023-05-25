import {
  Barycenter,
  BodyType,
  CelestialBody,
  Orbit,
  RotationParameters
} from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class CelestialBodyRepository extends BaseRepository<CelestialBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(CelestialBody, dataSource);
  }

  public async updateOneOrCreate(
    bodyId: number,
    systemAddress: number,
    bodyName: string,
    distanceFromArrival: number,
    bodyType: BodyType,
    orbit?: Orbit,
    rotationParameters?: RotationParameters,
    barycenter?: Barycenter
  ): Promise<CelestialBody> {
    let record: CelestialBody | null = await this.repository.findOne({
      where: { bodyId, systemAddress }
    });

    const celestialBody: OmitBaseEntity<CelestialBody> = {
      bodyId,
      systemAddress,
      bodyName,
      distanceFromArrival,
      bodyType,
      orbit,
      rotationParameters,
      barycenter
    };
    if (!record) return this.repository.create(celestialBody);

    record = CelestialBody.merge(record, celestialBody as CelestialBody);
    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreate(
    bodyId: number,
    systemAddress: number,
    bodyName: string,
    distanceFromArrival: number,
    bodyType: BodyType,
    orbit?: Orbit,
    rotationParameters?: RotationParameters,
    barycenter?: Barycenter
  ): Promise<CelestialBody> {
    return super._findOneOrCreate(
      { bodyId, systemAddress },
      {
        bodyId,
        systemAddress,
        bodyName,
        distanceFromArrival,
        bodyType,
        orbit,
        rotationParameters,
        barycenter
      }
    );
  }
}
