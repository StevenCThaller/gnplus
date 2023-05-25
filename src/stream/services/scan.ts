import {
  Atmosphere,
  AtmosphereComposition,
  AtmosphereType,
  Barycenter,
  BodyType,
  CelestialBody,
  Orbit,
  PlanetAtmosphere,
  PlanetaryBody,
  PlanetClass,
  PlanetComposition,
  PlanetarySurfaceDetails,
  RotationParameters,
  TerraformState,
  Volcanism,
  SystemCoordinates,
  StarSystem,
  Ring,
  RingClass,
  RingedBody,
  ReserveLevel,
  SurfaceMaterial,
  Material
} from "@api/models";

import {
  AtmosphereCompositionRepository,
  AtmosphereRepository,
  AtmosphereTypeRepository,
  BarycenterRepository,
  BodyTypeRepository,
  CelestialBodyRepository,
  OrbitRepository,
  PlanetAtmosphereRepository,
  PlanetClassRepository,
  PlanetCompositionRepository,
  RotationParametersRepository,
  TerraformStateRepository,
  VolcanismRepository,
  PlanetaryBodyRepository,
  PlanetarySurfaceDetailsRepository,
  SystemCoordinatesRepository,
  StarSystemRepository,
  RingClassRepository,
  RingRepository,
  ReserveLevelRepository,
  RingedBodyRepository,
  MaterialRepository,
  SurfaceMaterialRepository
} from "@api/repositories";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Service, Inject } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class ScanService {
  private manager?: EntityManager;
  constructor(
    @Inject("dataSource")
    private dataSource: DataSource,
    @Inject("logger")
    private logger: Logger
  ) {}

  /**
   *
   * @param atmosphere
   * @returns
   */
  public async findOrCreateAtmosphere(atmosphere: string): Promise<Atmosphere> {
    if (!atmosphere) throw "Atmosphere string required.";
    const repo: AtmosphereRepository = this.getRepo(AtmosphereRepository);
    const record: Atmosphere = await repo.findOneOrCreate(atmosphere);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param atmosphereType
   * @returns
   */
  public async findOrCreateAtmosphereType(
    atmosphereType: string
  ): Promise<AtmosphereType> {
    if (!atmosphereType) throw "Atmosphere Type string required.";
    const repo: AtmosphereTypeRepository = this.getRepo(
      AtmosphereTypeRepository
    );
    const record: AtmosphereType = await repo.findOneOrCreate(atmosphereType);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param planetAtmosphereId
   * @param bodyId
   * @param systemAddress
   * @param atmosphereComposition
   * @returns
   */
  public async findOrCreateAtmosphereComposition(
    planetAtmosphereId: number,
    bodyId: number,
    systemAddress: number,
    atmosphereComposition: AtmosphereCompositionData
  ): Promise<AtmosphereComposition> {
    const repo: AtmosphereCompositionRepository = this.getRepo(
      AtmosphereCompositionRepository
    );
    const atmosphereType: AtmosphereType =
      await this.findOrCreateAtmosphereType(atmosphereComposition.Name);
    const record: AtmosphereComposition = await repo.findOneOrCreate(
      planetAtmosphereId,
      bodyId,
      systemAddress,
      atmosphereType,
      atmosphereComposition.Percent
    );

    if (!record.atmosphereTypeId) await repo.save(record);
    return record;
  }

  /**
   *
   * @param planetAtmosphereId
   * @param data
   * @returns
   */
  public async findOrCreateAtmosphereCompositionArray(
    planetAtmosphereId: number,
    data: PlanetScanData
  ): Promise<AtmosphereComposition[]> {
    if (!data.AtmosphereComposition) return [];
    const output: AtmosphereComposition[] = [];

    for (const atmosphereComposition of data.AtmosphereComposition) {
      const record: AtmosphereComposition =
        await this.findOrCreateAtmosphereComposition(
          planetAtmosphereId,
          data.BodyID,
          data.SystemAddress,
          atmosphereComposition
        );
      output.push(record);
    }

    return output;
  }

  /**
   *
   * @param bodyId
   * @param systemAddress
   * @param ascendingNode
   * @param meanAnomaly
   * @returns
   */
  public async findOrCreateBarycenter(
    bodyId: number,
    systemAddress: number,
    ascendingNode: number,
    meanAnomaly: number
  ): Promise<Barycenter> {
    const repo: BarycenterRepository = this.getRepo(BarycenterRepository);
    const record: Barycenter = await repo.findOneOrCreate(
      bodyId,
      systemAddress,
      ascendingNode,
      meanAnomaly
    );
    await repo.save(record);
    return record;
  }

  /**
   *
   * @param bodyType
   * @returns
   */
  public async findOrCreateBodyType(bodyType: string): Promise<BodyType> {
    const repo: BodyTypeRepository = this.getRepo(BodyTypeRepository);
    const record: BodyType = await repo.findOneOrCreate(bodyType);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param bodyType
   * @param data
   * @returns
   */
  public async findOrCreateCelestialBody(
    bodyType: string,
    data: PlanetScanData
  ): Promise<any> {
    const repo: CelestialBodyRepository = this.getRepo(CelestialBodyRepository);
    const {
      BodyID,
      SystemAddress,
      BodyName,
      DistanceFromArrivalLS,
      OrbitalInclination,
      Periapsis,
      SemiMajorAxis,
      OrbitalPeriod,
      Eccentricity,
      Parents,
      AscendingNode,
      MeanAnomaly,
      AxialTilt,
      Radius,
      RotationPeriod
    } = data;

    const bodyTypeRecord: BodyType = await this.findOrCreateBodyType(bodyType);
    const orbitRecord: Orbit | undefined = OrbitalInclination
      ? await this.findOrCreateOrbit(
          BodyID,
          SystemAddress,
          SemiMajorAxis,
          OrbitalInclination,
          OrbitalPeriod,
          Eccentricity,
          Periapsis,
          Object.values(Parents[0])[0]
        )
      : undefined;

    const rotationParametersRecord: RotationParameters | undefined = AxialTilt
      ? await this.findOrCreateRotationParameters(
          BodyID,
          SystemAddress,
          RotationPeriod,
          AxialTilt,
          Radius
        )
      : undefined;
    const barycenterRecord: Barycenter | undefined = AscendingNode
      ? await this.findOrCreateBarycenter(
          BodyID,
          SystemAddress,
          AscendingNode,
          MeanAnomaly as number
        )
      : undefined;
    const record: CelestialBody = await repo.updateOneOrCreate(
      BodyID,
      SystemAddress,
      BodyName,
      DistanceFromArrivalLS,
      bodyTypeRecord,
      orbitRecord,
      rotationParametersRecord,
      barycenterRecord
    );

    if (!record.createdAt) await repo.save(record);
    return record;
  }

  public async findOrCreateOrbit(
    bodyId: number,
    systemAddress: number,
    semiMajorAxis: number,
    orbitalInclination: number,
    orbitalPeriod: number,
    eccentricity: number,
    periapsis: number,
    parentBodyId: number
  ): Promise<Orbit> {
    const repo: OrbitRepository = this.getRepo(OrbitRepository);
    const record: Orbit = await repo.findOneOrCreate(
      bodyId,
      systemAddress,
      semiMajorAxis,
      orbitalInclination,
      orbitalPeriod,
      eccentricity,
      periapsis,
      parentBodyId
    );
    await repo.save(record);
    return record;
  }

  public async findOrCreatePlanetAtmosphere(
    data: PlanetScanData
  ): Promise<PlanetAtmosphere | undefined> {
    // this.logger.info("ATMOSPHERE: %s", data.Atmosphere);
    // this.logger.info("ATMOSPHERE TYPE: %s", data.AtmosphereType);
    // this.logger.info("ATMOSPHERE COMPOSITION: %o", data.AtmosphereComposition);
    if (!data.Atmosphere && !data.AtmosphereType && !data.AtmosphereComposition)
      return;
    const repo: PlanetAtmosphereRepository = this.getRepo(
      PlanetAtmosphereRepository
    );
    let atmosphereRecord: Atmosphere | undefined;
    if (data.Atmosphere)
      atmosphereRecord = await this.findOrCreateAtmosphere(data.Atmosphere);
    const record: PlanetAtmosphere = await repo.findOneOrCreate({
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      atmosphere: atmosphereRecord,
      atmosphereType: data.AtmosphereType
        ? await this.findOrCreateAtmosphereType(data.AtmosphereType)
        : undefined
    });

    if (!record.hasId()) await repo.save(record);

    return record;
  }

  /**
   *
   * @param planetClass
   * @returns
   */
  public async findOrCreatePlanetClass(
    planetClass: string
  ): Promise<PlanetClass> {
    if (!planetClass || typeof planetClass !== "string")
      throw "Invalid planet class input. Must be a string.";
    const repo: PlanetClassRepository = this.getRepo(PlanetClassRepository);
    const record: PlanetClass = await repo.findOneOrCreate(planetClass);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param composition
   * @returns
   */
  public async findOrCreatePlanetComposition(
    bodyId: number,
    systemAddress: number,
    composition: PlanetCompositionData
  ): Promise<PlanetComposition> {
    const repo: PlanetCompositionRepository = this.getRepo(
      PlanetCompositionRepository
    );
    const record: PlanetComposition = await repo.findOneOrCreate(
      bodyId,
      systemAddress,
      composition.Ice,
      composition.Rock,
      composition.Metal
    );
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param scan
   * @returns
   */
  public async findOrCreatePlanetSurfaceDetails(
    scan: PlanetScanData
  ): Promise<PlanetarySurfaceDetails> {
    const repo: PlanetarySurfaceDetailsRepository = this.getRepo(
      PlanetarySurfaceDetailsRepository
    );
    const record: PlanetarySurfaceDetails = await repo.findOneOrCreate({
      ...this.getSurfaceDetailParams(scan),
      volcanism: await this.findOrCreateVolcanism(scan.Volcanism),
      terraformState: await this.findOrCreateTerraformState(scan.TerraformState)
    });
    if (!record.volcanismId) await repo.save(record);
    return record;
  }

  public async findOrCreateReserveLevel(
    reserveLevel: string
  ): Promise<ReserveLevel> {
    if (!reserveLevel) throw "No reserve level provided";
    const repo = this.getRepo(ReserveLevelRepository);
    const record = await repo.findOneOrCreate(reserveLevel);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateRing(
    bodyId: number,
    systemAddress: number,
    ring: RingData
  ): Promise<Ring> {
    const repo: RingRepository = this.getRepo(RingRepository);
    const ringClassRecord: RingClass = await this.findOrCreateRingClass(
      ring.RingClass
    );
    const record: Ring = await repo.findOneOrCreate({
      bodyId,
      systemAddress,
      ringName: ring.Name,
      innerRadius: ring.InnerRad,
      outerRadius: ring.OuterRad,
      ringClass: ringClassRecord,
      massMegatons: ring.MassMT
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param bodyId
   * @param systemAddress
   * @param rings
   * @returns
   */
  public async findOrCreateRingArray(
    bodyId: number,
    systemAddress: number,
    rings: RingData[]
  ): Promise<Ring[]> {
    if (!rings) throw "No rings provided";
    const output: Ring[] = [];
    for (const ring of rings) {
      const record: Ring = await this.findOrCreateRing(
        bodyId,
        systemAddress,
        ring
      );
      output.push(record);
    }
    return output;
  }

  public async findOrCreateRingClass(className: string): Promise<RingClass> {
    const repo: RingClassRepository = this.getRepo(RingClassRepository);
    const record: RingClass = await repo.findOneOrCreate(className);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateRingedBody(
    data: PlanetScanData
  ): Promise<RingedBody> {
    // if (!data.ReserveLevel) throw "no";
    const repo: RingedBodyRepository = this.getRepo(RingedBodyRepository);

    const record: RingedBody = await repo.findOneOrCreate({
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress
    });
    if (data.ReserveLevel) {
      record.reserves = await this.findOrCreateReserveLevel(data.ReserveLevel);
    }

    if (data.Rings) {
      record.rings = await this.findOrCreateRingArray(
        data.BodyID,
        data.SystemAddress,
        data.Rings
      );
    }

    await repo.save(record);
    return record;
  }

  public async findOrCreateRotationParameters(
    bodyId: number,
    systemAddress: number,
    rotationPeriod: number,
    axialTilt: number,
    radius: number
  ): Promise<RotationParameters> {
    const repo: RotationParametersRepository = this.getRepo(
      RotationParametersRepository
    );
    const record: RotationParameters = await repo.findOneOrCreate(
      bodyId,
      systemAddress,
      rotationPeriod,
      axialTilt,
      radius
    );
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param terraformState
   * @returns
   */
  public async findOrCreateTerraformState(
    terraformState: string
  ): Promise<TerraformState> {
    const repo: TerraformStateRepository = this.getRepo(
      TerraformStateRepository
    );
    const record: TerraformState = await repo.findOneOrCreate(terraformState);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param volcanism
   * @returns
   */
  public async findOrCreateVolcanism(volcanism: string): Promise<Volcanism> {
    const repo: VolcanismRepository = this.getRepo(VolcanismRepository);
    const record: Volcanism = await repo.findOneOrCreate(volcanism);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  /**
   *
   * @param data
   * @returns
   */
  public async handleEvent(data: ScanData): Promise<void> {
    return this.dataSource.transaction(
      async (transaction: EntityManager): Promise<void> => {
        this.manager = transaction;

        await this.findOrCreateBaseSystem(
          data.SystemAddress,
          data.StarSystem,
          data.StarPos
        );

        if (hasOwnProperty(data, "StarType"))
          await this.updateOrCreateStar(data as StarScanData);
        else if (hasOwnProperty(data, "PlanetClass"))
          await this.updateOrCreatePlanet(data as PlanetScanData);
        else await this.updateOrCreateAsteroidBeltCluster(data);
      }
    );
  }

  public async updateOrCreateStar(data: StarScanData): Promise<void> {}

  /**
   *
   * @param data
   * @returns
   */
  public async updateOrCreatePlanet(data: PlanetScanData): Promise<void> {
    const repo: PlanetaryBodyRepository = this.getRepo(PlanetaryBodyRepository);

    await this.findOrCreateCelestialBody("Planet", data);

    const record: PlanetaryBody = await repo.updateOneOrCreate({
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      bodyName: data.BodyName,
      planetClass: await this.findOrCreatePlanetClass(data.PlanetClass),
      surfaceDetails: await this.findOrCreatePlanetSurfaceDetails(data),
      planetComposition: data.Composition
        ? await this.findOrCreatePlanetComposition(
            data.BodyID,
            data.SystemAddress,
            data.Composition
          )
        : undefined,
      planetAtmosphere: await this.findOrCreatePlanetAtmosphere(data)
    });

    if (data.Materials) {
      record.surfaceMaterials = await this.findOrCreateSurfaceMaterialArray(
        data.BodyID,
        data.SystemAddress,
        data.Materials
      );
    }

    await repo.save(record);

    await this.findOrCreateRingedBody(data);
  }

  public async findOrCreateMaterial(material: string): Promise<Material> {
    const repo: MaterialRepository = this.getRepo(MaterialRepository);
    const record: Material = await repo.findOneOrCreate(material);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateSurfaceMaterial(
    bodyId: number,
    systemAddress: number,
    material: MaterialData
  ): Promise<SurfaceMaterial> {
    const repo: SurfaceMaterialRepository = this.getRepo(
      SurfaceMaterialRepository
    );
    const materialRecord: Material = await this.findOrCreateMaterial(
      material.Name
    );
    const record: SurfaceMaterial = await repo.findOneOrCreate({
      bodyId,
      systemAddress,
      material: materialRecord,
      percent: material.Percent
    });
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateSurfaceMaterialArray(
    bodyId: number,
    systemAddress: number,
    surfaceMaterials: MaterialData[]
  ): Promise<SurfaceMaterial[]> {
    const output: SurfaceMaterial[] = [];

    for (const material of surfaceMaterials) {
      const record: SurfaceMaterial = await this.findOrCreateSurfaceMaterial(
        bodyId,
        systemAddress,
        material
      );
      output.push(record);
    }
    return output;
  }

  public async updateOrCreateAsteroidBeltCluster(
    data: ScanData
  ): Promise<void> {}

  /**
   *
   * DTO converters
   */
  private getSurfaceDetailParams(
    data: PlanetScanData
  ): Partial<SurfaceDetailsParams> {
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      massEM: data.MassEM,
      tidalLock: data.TidalLock,
      landable: data.Landable,
      surfaceGravity: data.SurfaceGravity,
      surfacePressure: data.SurfacePressure,
      surfaceTemperature: data.SurfaceTemperature
    };
  }

  /**
   *
   * @param systemAddress
   * @param starSystem
   * @param systemCoordinates
   * @returns
   */
  protected async findOrCreateBaseSystem(
    systemAddress: number,
    starSystem: string,
    systemCoordinates: SystemCoordinatesParams
  ): Promise<any> {
    const systemCoordinatesRecord = await this.findOrCreateSystemCoordinates(
      systemCoordinates
    );
    const repo: StarSystemRepository = this.getRepo(StarSystemRepository);
    const record: StarSystem = await repo.findOneOrCreateBase(
      systemAddress,
      starSystem,
      systemCoordinatesRecord
    );
    if (!record.createdAt) {
      await repo.save(record);
    }
    return record;
  }

  /**
   *
   * @param coordinates
   * @returns
   */
  public async findOrCreateSystemCoordinates(
    coordinates: SystemCoordinatesParams
  ): Promise<SystemCoordinates> {
    if (!this.isSystemCoordinates(coordinates))
      throw "Invalid data type. Coordinates must be an array of 3 numbers";
    const repo: SystemCoordinatesRepository = this.getRepo(
      SystemCoordinatesRepository
    );
    const [x, y, z] = coordinates;
    const record = await repo.findOneOrCreate(x, y, z);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  private isSystemCoordinates(coordinates: any): boolean {
    return (
      Array.isArray(coordinates) &&
      coordinates.length === 3 &&
      coordinates.some((value: any): boolean => typeof value === "number")
    );
  }

  /**
   *
   * @param repository - Repository service class
   * @returns An actual repository service.
   */
  public getRepo<T>(repository: Newable<T>): T {
    return new repository(this.manager || this.dataSource);
  }
}
