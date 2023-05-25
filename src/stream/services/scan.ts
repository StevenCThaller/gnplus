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
  PlanetarySurfaceDetails,
  RotationParameters,
  TerraformState,
  Volcanism
} from "@api/models";
import PlanetaryBody from "@api/models/planetaryBody.model";
import StellarBody from "@api/models/stellarBody.model";
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
  RotationParametersRepository,
  TerraformStateRepository,
  VolcanismRepository
} from "@api/repositories";
import PlanetCompositionRepository from "@api/repositories/planetComposition.repository";
import PlanetaryBodyRepository from "@api/repositories/planetaryBody.repository";
import PlanetarySurfaceDetailsRepository from "@api/repositories/planetarySurfaceDetailsRepository";
import BasicSystemService from "@stream/base/baseSystemHandler";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Service, Inject } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class ScanService extends BasicSystemService {
  // private manager?: EntityManager;
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource);
  }

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

  public async findOrCreateAtmosphereComposition(
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
      bodyId,
      systemAddress,
      atmosphereType,
      atmosphereComposition.Percent
    );

    if (!record.atmosphereTypeId) await repo.save(record);
    return record;
  }

  public async findOrCreateAtmosphereCompositionArray(
    data: PlanetScanData
  ): Promise<AtmosphereComposition[]> {
    if (!data.AtmosphereComposition) return [];
    const output: AtmosphereComposition[] = [];

    for (const atmosphereComposition of data.AtmosphereComposition) {
      const record: AtmosphereComposition =
        await this.findOrCreateAtmosphereComposition(
          data.BodyID,
          data.SystemAddress,
          atmosphereComposition
        );
      output.push(record);
    }

    return output;
  }

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

  public async findOrCreateBodyType(bodyType: string): Promise<BodyType> {
    const repo: BodyTypeRepository = this.getRepo(BodyTypeRepository);
    const record: BodyType = await repo.findOneOrCreate(bodyType);
    if (!record.hasId()) await repo.save(record);
    return record;
  }

  public async findOrCreateCelestialBody(
    bodyType: string,
    data: PlanetScanData
  ): Promise<CelestialBody> {
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
    if (!data.Atmosphere && !data.AtmosphereType && !data.AtmosphereComposition)
      return;
    const repo: PlanetAtmosphereRepository = this.getRepo(
      PlanetAtmosphereRepository
    );
    const record: PlanetAtmosphere = await repo.findOneOrCreate({
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      atmosphere: data.Atmosphere
        ? await this.findOrCreateAtmosphere(data.Atmosphere)
        : undefined,
      atmosphereType: data.AtmosphereType
        ? await this.findOrCreateAtmosphereType(data.AtmosphereType)
        : undefined
    });
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
    composition: PlanetCompositionData
  ): Promise<PlanetComposition> {
    const repo: PlanetCompositionRepository = this.getRepo(
      PlanetCompositionRepository
    );
    const record: PlanetComposition = await repo.findOneOrCreate(
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
    this.logger.info("Rotation Params has ID? %s", record.hasId());
    await repo.save(record);
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
        this.dataSource = transaction;

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
        ? await this.findOrCreatePlanetComposition(data.Composition)
        : undefined,
      planetAtmosphere: await this.findOrCreatePlanetAtmosphere(data)
    });

    await repo.save(record);
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
}
