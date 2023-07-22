import { Inject, Service } from "typedi";
import { Logger } from "winston";
import { Repository } from "typeorm";
import {
  Atmosphere,
  AtmosphereComposition,
  AtmosphereType,
  Barycenter,
  BodyType,
  CelestialBody,
  Orbit,
  PlanetAtmosphere,
  PlanetClass,
  PlanetComposition,
  PlanetaryBody,
  PlanetarySurfaceDetails,
  ReserveLevel,
  Ring,
  RingClass,
  RingedBody,
  RotationParameters,
  StarSystem,
  TerraformState,
  Volcanism
} from "@models/index";
import QueryService from "./query.service";

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

  public async upsertCelestialBodyRelationships(
    celestialBody: CelestialBody,
    scanData: ScanData
  ): Promise<void> {
    this.upsertParentBody(celestialBody, scanData.Parents);
    await this.queryService.saveRecord(CelestialBody, celestialBody);

    await Promise.all([
      this.upsertBarycenter(Barycenter.convertScan(scanData)),
      this.upsertOrbit(Orbit.convertScan(scanData)),
      this.upsertRingedBody(celestialBody, scanData)
    ]);
  }

  private async createCelestialBody(scanData: ScanData): Promise<CelestialBody> {
    const bodyType: BodyType = await this.findBodyType(scanData);
    if (!bodyType || !bodyType.id) throw "Could not find BodyType";

    return CelestialBody.createFromScan(scanData, bodyType.id);
  }

  public async updateOrInsertCelestialBody(scanData: ScanData): Promise<void> {
    return this.queryService.transaction(async (): Promise<void> => {
      const repo: Repository<CelestialBody> = this.queryService.getRepository(CelestialBody);

      await this.queryService.findOrInsertBaseStarSystem(StarSystem.convertScan(scanData));

      let record: CelestialBody | null = await repo.findOne({
        where: {
          bodyId: scanData.BodyID,
          systemAddress: scanData.SystemAddress
        }
      });

      if (!record) {
        record = await this.createCelestialBody(scanData);
      } else {
        record.updatedAt = new Date(scanData.timestamp);
      }

      await Promise.all([
        this.upsertCelestialBodyRelationships(record, scanData),
        this.updateOrInsertAssociatedBody(scanData)
      ]);
    });
  }

  private async updateOrInsertAssociatedBody(scanData: ScanData): Promise<void> {
    const bodyTypeName = this.getBodyTypeName(scanData);
    // this.logger.info("BODY TYPE: %s", bodyTypeName);

    switch (bodyTypeName) {
      case "Planet":
        await this.updateOrInsertPlanet(scanData as PlanetScanData);
        return;
    }
  }

  public async upsertRotationParameters(scanData: ScanData): Promise<void> {
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
      }
    );
  }

  public async upsertOrbit(scanData: OrbitParams): Promise<void> {
    if (
      scanData.orbitalInclination == null &&
      scanData.periapsis == null &&
      scanData.semiMajorAxis == null &&
      scanData.orbitalPeriod == null &&
      scanData.eccentricity == null
    )
      return;

    const { bodyId, systemAddress } = scanData;

    await this.queryService.findOrCreateEntity(Orbit, { bodyId, systemAddress }, scanData);
  }

  public async upsertBarycenter(scanData: BarycenterParams): Promise<void> {
    if (scanData.ascendingNode == null && scanData.meanAnomaly == null) return;

    await this.queryService.findOrCreateEntity(
      Barycenter,
      { bodyId: scanData.bodyId, systemAddress: scanData.systemAddress },
      {
        bodyId: scanData.bodyId,
        systemAddress: scanData.systemAddress,
        ascendingNode: scanData.ascendingNode,
        meanAnomaly: scanData.meanAnomaly
      }
    );
  }

  public async updateOrInsertPlanet(scanData: PlanetScanData): Promise<PlanetaryBody> {
    const repo: Repository<PlanetaryBody> = this.queryService.getRepository(PlanetaryBody);

    let record: PlanetaryBody | null = await repo.findOne({
      where: { bodyId: scanData.BodyID, systemAddress: scanData.SystemAddress }
    });

    if (!record) {
      record = new PlanetaryBody(scanData.BodyID, scanData.SystemAddress);
    }

    await Promise.all([
      this.upsertPlanetClass(record, scanData.PlanetClass),
      this.upsertPlanetSurfaceDetails(record, scanData),
      this.upsertPlanetComposition(record, scanData.Composition),
      this.upsertPlanetAtmosphere(record, scanData)
    ]);

    await repo.save(record);

    return record;
  }

  private async upsertRingedBody(planet: CelestialBody, scanData: ScanData): Promise<void> {
    if (!scanData.Rings || scanData.Rings.length === 0) return;
    const repo: Repository<RingedBody> = this.queryService.getRepository(RingedBody);

    let record: RingedBody | null = await repo.findOne({
      where: { bodyId: planet.bodyId, systemAddress: planet.systemAddress }
    });

    if (!record) {
      record = new RingedBody(RingedBody.convertScan(scanData) as RingedBodyParams);
    } else {
      record.updatedAt = new Date(scanData.timestamp);
    }

    await this.upsertRingedBodyRelationships(record, scanData);
    await repo.save(record);
  }

  private async upsertRingedBodyRelationships(
    ringedBody: RingedBody,
    scanData: ScanData
  ): Promise<void> {
    await Promise.all([
      this.upsertRingedBodyReserveLevel(ringedBody, scanData.ReserveLevel),
      this.upsertRings(Ring.convertScan(scanData))
    ]);
  }

  private async upsertRings(rings: RingParams[]): Promise<void> {
    await Promise.all(
      rings.map(async (ring: RingParams): Promise<Ring> => await this.findOrInsertRing(ring))
    );
  }

  private async findOrInsertRing(params: RingParams): Promise<Ring> {
    const { ringClass: className, ...ringParams } = params;
    const ringClassRecord: RingClass = await this.queryService.findOrCreateEntity(
      RingClass,
      {
        className
      },
      false
    );

    return await this.queryService.findOrCreateEntity(
      Ring,
      { ringName: params.ringName },
      { ...ringParams, ringClassId: ringClassRecord.id }
    );
  }

  private async upsertRingedBodyReserveLevel(
    ringedBody: RingedBody,
    reserveLevel?: string
  ): Promise<void> {
    if (!reserveLevel) return;
    const reserveLevelRecord: ReserveLevel = await this.queryService.findOrCreateEntity(
      ReserveLevel,
      { reserveLevel }
    );
    ringedBody.reserveLevelId = reserveLevelRecord.id;
  }

  private async upsertPlanetAtmosphere(
    planet: PlanetaryBody,
    scanData: PlanetScanData
  ): Promise<void> {
    const repo: Repository<PlanetAtmosphere> = this.queryService.getRepository(PlanetAtmosphere);

    let record: PlanetAtmosphere | null = await repo.findOne({
      where: { bodyId: planet.bodyId, systemAddress: planet.systemAddress }
    });

    if (!record) {
      record = new PlanetAtmosphere();
      record.bodyId = planet.bodyId;
      record.systemAddress = planet.systemAddress;
    }

    await Promise.all([
      this.upsertAtmosphereType(record, scanData.AtmosphereType),
      this.upsertAtmosphere(record, scanData.Atmosphere)
    ]);

    await repo.save(record);

    await this.upsertAtmosphereComposition(record, scanData.AtmosphereComposition);
    await repo.save(record);
  }

  private async upsertAtmosphereComposition(
    planetAtmosphere: PlanetAtmosphere,
    atmosphereCompositions?: AtmosphereCompositionData[]
  ): Promise<void> {
    if (!atmosphereCompositions) {
      planetAtmosphere.atmosphereComposition = [];
      return;
    }

    const atmosphereCompositionRecords: AtmosphereComposition[] = await Promise.all(
      atmosphereCompositions.map(
        async (atmosphereComposition: AtmosphereCompositionData): Promise<AtmosphereComposition> =>
          await this.findOrCreateAtmosphereComposition(
            planetAtmosphere.id as number,
            atmosphereComposition.Name,
            atmosphereComposition.Percent
          )
      )
    );

    planetAtmosphere.atmosphereComposition = atmosphereCompositionRecords;
  }

  private async findOrCreateAtmosphereComposition(
    planetAtmosphereId: number,
    atmosphereType: string,
    percent: number
  ): Promise<AtmosphereComposition> {
    const atmosphereTypeRecord: AtmosphereType = await this.queryService.findOrCreateEntity(
      AtmosphereType,
      { atmosphereType }
    );
    const record: AtmosphereComposition = await this.queryService.findOrCreateEntity(
      AtmosphereComposition,
      { planetAtmosphereId, atmosphereTypeId: atmosphereTypeRecord.id },
      { planetAtmosphereId, atmosphereTypeId: atmosphereTypeRecord.id, percent }
    );

    return record;
  }

  private async upsertAtmosphereType(
    planetAtmosphere: PlanetAtmosphere,
    atmosphereType?: string
  ): Promise<void> {
    if (!atmosphereType) return;

    const atmosphereTypeRecord: AtmosphereType = await this.queryService.findOrCreateEntity(
      AtmosphereType,
      { atmosphereType }
    );

    planetAtmosphere.atmosphereTypeId = atmosphereTypeRecord.id;
  }

  private async upsertAtmosphere(
    planetAtmosphere: PlanetAtmosphere,
    atmosphere?: string
  ): Promise<void> {
    if (!atmosphere) return;

    const atmosphereRecord: Atmosphere = await this.queryService.findOrCreateEntity(Atmosphere, {
      atmosphere
    });

    planetAtmosphere.atmosphereId = atmosphereRecord.id;
  }

  private async upsertPlanetComposition(
    planet: PlanetaryBody,
    composition?: PlanetCompositionData
  ): Promise<void> {
    if (!composition) return;

    const planetCompositionRecord: PlanetComposition = await this.queryService.findOrCreateEntity(
      PlanetComposition,
      { ice: composition.Ice, metal: composition.Metal, rock: composition.Rock }
    );

    planet.planetCompositionId = planetCompositionRecord.id;
  }

  private async upsertPlanetSurfaceDetails(
    planet: PlanetaryBody,
    scanData: PlanetScanData
  ): Promise<void> {
    if (!this.scanHasSurfaceDetails(scanData)) return;

    const repo: Repository<PlanetarySurfaceDetails> =
      this.queryService.getRepository(PlanetarySurfaceDetails);

    let record: PlanetarySurfaceDetails | null = await repo.findOne({
      where: { bodyId: scanData.BodyID, systemAddress: scanData.SystemAddress }
    });

    if (!record) {
      record = new PlanetarySurfaceDetails(
        scanData.BodyID,
        scanData.SystemAddress,
        scanData.MassEM,
        scanData.TidalLock,
        scanData.Landable,
        scanData.SurfaceGravity,
        scanData.SurfacePressure,
        scanData.SurfaceTemperature
      );
    }

    await Promise.all([
      this.upsertVolcanism(record, scanData.Volcanism),
      this.upsertTerraformState(record, scanData.TerraformState)
    ]);

    planet.surfaceDetails = record;
  }

  private async upsertTerraformState(
    surfaceDetails: PlanetarySurfaceDetails,
    terraformState?: string
  ): Promise<void> {
    if (!terraformState) return;

    const terraformStateRecord: TerraformState = await this.queryService.findOrCreateEntity(
      TerraformState,
      { stateName: terraformState }
    );

    surfaceDetails.terraformStateId = terraformStateRecord.id;
  }

  private async upsertVolcanism(
    surfaceDetails: PlanetarySurfaceDetails,
    volcanism?: string
  ): Promise<void> {
    if (!volcanism) return;

    const volcanismRecord: Volcanism = await this.queryService.findOrCreateEntity(Volcanism, {
      volcanism
    });
    surfaceDetails.volcanismId = volcanismRecord.id;
  }

  private scanHasSurfaceDetails(scanData: PlanetScanData): boolean {
    return (
      !scanData.MassEM &&
      !scanData.TidalLock &&
      !scanData.Landable &&
      !scanData.SurfaceGravity &&
      !scanData.SurfacePressure &&
      !scanData.SurfaceTemperature &&
      !scanData.TerraformState &&
      !scanData.Volcanism
    );
  }

  public async upsertPlanetClass(planet: PlanetaryBody, className: string): Promise<void> {
    const record = await this.queryService.findOrCreateEntity(PlanetClass, { className });
    planet.planetClassId = record.id;
  }

  private upsertParentBody(celestialBody: CelestialBody, parents?: ParentData[]): void {
    if (!parents || parents.length === 0) return;

    const parentIds: number[] = Object.values(parents[0]);
    celestialBody.parentBodyId = parentIds[0];
  }

  public getBodyTypeName(scanData: ScanData): string {
    let bodyType = "AsteroidBelt";
    if (scanData.StarType) bodyType = "Star";
    else if (scanData.PlanetClass) bodyType = "Planet";
    else if (scanData.BodyName.toLowerCase().includes("cluster")) bodyType = "BeltCluster";
    else if (scanData.BodyName.toLowerCase().includes("ring")) bodyType = "Ring";
    else if (scanData.BodyName.toLowerCase().includes("belt")) bodyType = "AsteroidBelt";

    return bodyType;
  }

  public async findBodyType(scanData: ScanData): Promise<BodyType> {
    const repo: Repository<BodyType> = this.queryService.getRepository(BodyType);

    const record: BodyType | null = await repo.findOne({
      where: { bodyType: this.getBodyTypeName(scanData) }
    });
    if (!record) throw "No Record Found";

    return record;
  }
}
