import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { Logger } from "winston";
import { EntityManager, Repository } from "typeorm";
import {
  Barycenter,
  BodyType,
  CelestialBody,
  Orbit,
  PlanetClass,
  PlanetaryBody,
  RotationParameters
} from "@models/index";

@Service()
export default class ScanService {
  /**
   *
   */
  constructor(
    @Inject()
    private queryService: QueryService,
    @Inject("logger")
    private logger: Logger
  ) {}

  public async updateOrCreateBody(scanData: ScanData): Promise<void> {
    return this.queryService.transaction(async (transaction: EntityManager): Promise<void> => {
      const repo: Repository<CelestialBody> = transaction.getRepository(CelestialBody);

      await this.queryService.findOrCreateBaseStarSystem(
        scanData.SystemAddress,
        scanData.StarSystem,
        scanData.StarPos,
        scanData.timestamp,
        transaction
      );

      let record: CelestialBody | null = await repo.findOne({
        where: {
          bodyId: scanData.BodyID,
          systemAddress: scanData.SystemAddress
        }
      });

      const bodyType: BodyType = await this.findBodyType(scanData, transaction);
      if (!record) {
        record = new CelestialBody(
          scanData.BodyID,
          scanData.SystemAddress,
          scanData.BodyName,
          scanData.DistanceFromArrivalLS,
          bodyType.id as number,
          scanData.timestamp
        );
      } else {
        record.updatedAt = new Date(scanData.timestamp);
      }
      if (scanData.Parents) this.upsertParentBody(record, scanData.Parents);

      await repo.save(record);

      await Promise.all([
        this.upsertBarycenter(scanData, transaction),
        this.upsertOrbit(scanData, transaction)
      ]);

      if (bodyType.bodyType === "Planet")
        await this.updateOrCreatePlanet(scanData as PlanetScanData, transaction);
      // if(bodyType.bodyType === "Star")
    });
  }

  public async upsertRotationParameters(
    scanData: ScanData,
    entityManager?: EntityManager
  ): Promise<void> {
    if (scanData.RotationPeriod == null && scanData.AxialTilt == null && scanData.Radius == null)
      return;

    await this.queryService.findOrCreateEntity(
      RotationParameters,
      {
        bodyId: scanData.BodyID,
        systemAddress: scanData.SystemAddress
      },
      {
        bodyId: scanData.BodyID,
        systemAddress: scanData.SystemAddress,
        rotationPeriod: scanData.RotationPeriod,
        axialTilt: scanData.AxialTilt,
        radius: scanData.Radius
      },
      entityManager
    );
  }

  public async upsertOrbit(scanData: ScanData, entityManager?: EntityManager): Promise<void> {
    if (
      scanData.OrbitalInclination == null &&
      scanData.Periapsis == null &&
      scanData.SemiMajorAxis == null &&
      scanData.OrbitalPeriod == null &&
      scanData.Eccentricity == null
    )
      return;

    await this.queryService.findOrCreateEntity(
      Orbit,
      {
        bodyId: scanData.BodyID,
        systemAddress: scanData.SystemAddress
      },
      {
        bodyId: scanData.BodyID,
        systemAddress: scanData.SystemAddress,
        orbitalInclination: scanData.OrbitalInclination,
        periapsis: scanData.Periapsis,
        semiMajorAxis: scanData.SemiMajorAxis,
        orbitalPeriod: scanData.OrbitalPeriod,
        eccentricity: scanData.Eccentricity
      },
      entityManager
    );
  }

  public async upsertBarycenter(scanData: ScanData, entityManager?: EntityManager): Promise<void> {
    if (scanData.AscendingNode == null && scanData.MeanAnomaly == null) return;

    await this.queryService.findOrCreateEntity(
      Barycenter,
      { bodyId: scanData.BodyID, systemAddress: scanData.SystemAddress },
      {
        bodyId: scanData.BodyID,
        systemAddress: scanData.SystemAddress,
        ascendingNode: scanData.AscendingNode,
        meanAnomaly: scanData.MeanAnomaly
      },
      entityManager
    );
  }

  public async updateOrCreatePlanet(
    scanData: PlanetScanData,
    entityManager?: EntityManager
  ): Promise<PlanetaryBody> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<PlanetaryBody> = entityManager.getRepository(PlanetaryBody);

    let record: PlanetaryBody | null = await repo.findOne({
      where: { bodyId: scanData.BodyID, systemAddress: scanData.SystemAddress }
    });

    if (!record) {
      record = new PlanetaryBody(scanData.BodyID, scanData.SystemAddress);
    }

    await Promise.all([this.upsertPlanetClass(record, scanData.PlanetClass, entityManager)]);

    return record;
  }

  public async upsertPlanetClass(
    planet: PlanetaryBody,
    className: string,
    entityManager: EntityManager
  ): Promise<void> {
    const record = await this.queryService.findOrCreateEntity(
      PlanetClass,
      { className },
      entityManager
    );
    planet.planetClassId = record.id;
  }

  private upsertParentBody(celestialBody: CelestialBody, parents?: ParentData[]): void {
    if (!parents) return;

    const parentIds: number[] = Object.values(parents[0]);
    celestialBody.parentBodyId = parentIds[0];
  }

  public async findBodyType(scanData: ScanData, entityManager?: EntityManager): Promise<BodyType> {
    if (!entityManager) entityManager = this.queryService.getEntityManager();
    const repo: Repository<BodyType> = entityManager.getRepository(BodyType);
    let bodyType = "AsteroidBelt";
    if (scanData.StarType) bodyType = "Star";
    else if (scanData.PlanetClass) bodyType = "Planet";
    else if (scanData.BodyName.toLowerCase().includes("cluster")) bodyType = "BeltCluster";
    else if (scanData.BodyName.toLowerCase().includes("ring")) bodyType = "Ring";

    const record: BodyType | null = await repo.findOne({ where: { bodyType } });
    if (!record) throw "No Record Found";

    return record;
  }
}
