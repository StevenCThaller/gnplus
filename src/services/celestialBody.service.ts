import Container, { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { BodyType, CelestialBody, RotationParameters } from "@models/index";
import BarycenterService from "./barycenter.service";
import OrbitService from "./orbit.service";

@Service()
export default class CelestialBodyService extends DatabaseService<CelestialBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, CelestialBody);
    this.repository = this.dataSource.getRepository(CelestialBody);
  }

  public async findOrCreate(
    params: CelestialBodyParams,
    manager?: EntityManager
  ): Promise<CelestialBody> {
    let repo: Repository<CelestialBody> = this.repository;
    if (manager) {
      repo = manager.getRepository(CelestialBody);
    }

    try {
      const {
        bodyId,
        system: { systemAddress }
      } = params;
      let celestialBodyRecord: CelestialBody | null = await repo.findOne({
        where: { bodyId, systemAddress }
      });

      if (!celestialBodyRecord) {
        celestialBodyRecord = repo.create({
          bodyId,
          systemAddress,
          bodyName: params.bodyName,
          distanceFromArrival: params.distanceFromArrival,
          parentBodyId: params.parentBodyId,
          createdAt: params.createdAt,
          updatedAt: params.updatedAt
        });
      } else {
        if (params.bodyName) celestialBodyRecord.bodyName = params.bodyName;
        if (params.distanceFromArrival)
          celestialBodyRecord.distanceFromArrival = params.distanceFromArrival;
        if (params.parentBodyId) celestialBodyRecord.parentBodyId = params.parentBodyId;
        celestialBodyRecord.updatedAt = params.updatedAt;
      }

      await Promise.all([
        this.upsertBarycenter(celestialBodyRecord, params.barycenter),
        this.upsertOrbit(celestialBodyRecord, params.orbit),
        this.upsertBodyType(celestialBodyRecord, params.bodyType),
        this.upsertRotationParams(celestialBodyRecord, params.rotationParams)
      ]);

      await repo.save(celestialBodyRecord);
      return celestialBodyRecord;
    } catch (error) {
      this.logger.error("Error thrown while running CelestialBodyService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertRotationParams(
    bodyRecord: CelestialBody,
    rotationParams?: RotationParametersParams
  ): Promise<void> {
    if (rotationParams) {
      const { bodyId, systemAddress } = rotationParams;
      bodyRecord.rotationParameters = await this.findOrCreateEntity(
        RotationParameters,
        { bodyId, systemAddress },
        rotationParams
      );
    }
  }

  private async upsertBodyType(bodyRecord: CelestialBody, bodyType?: string): Promise<void> {
    if (bodyType) {
      bodyRecord.bodyType = await this.findOrCreateEntity(BodyType, { bodyType });
    }
  }

  private async upsertBarycenter(
    bodyRecord: CelestialBody,
    params?: BarycenterParams,
    manager?: EntityManager
  ): Promise<void> {
    if (params) {
      const barycenter = await Container.get(BarycenterService).findOrCreate(params, manager);
      bodyRecord.barycenterId = barycenter.id;
    }
  }

  private async upsertOrbit(
    bodyRecord: CelestialBody,
    params?: OrbitParams,
    manager?: EntityManager
  ): Promise<void> {
    if (params) {
      const orbit = await Container.get(OrbitService).findOrCreate(params, manager);
      bodyRecord.orbitId = orbit.id;
    }
  }
}
