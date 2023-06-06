import Container, { Service, Inject } from "typedi";
import zlib from "zlib";
import { Subscriber } from "zeromq";
import { Logger } from "winston";
import config from "@config/index";
import { DataSource, EntityManager } from "typeorm";
import {
  BeltCluster,
  CelestialBody,
  PlanetaryBody,
  Ring,
  StarSystem,
  Station,
  StellarBody,
  SystemConflict,
  SystemFaction,
  ThargoidWar
} from "@models/index";
import StationService from "@services/station.service";
import StarSystemService from "@services/starSystem.service";
import SystemFactionService from "@services/systemFaction.service";
import ThargoidWarService from "@services/thargoidWar.service";
import SystemConflictService from "@services/systemConflict.service";
import StationEconomyService from "@services/stationEconomy.service";
import CelestialBodyService from "@services/celestialBody.service";
import StellarBodyService from "@services/stellarBody.service";
import AsteroidBeltService from "@services/asteroidBelt.service";
import extractBeltName from "@utils/extractBeltName";
import BeltClusterService from "@services/beltCluster.service";
import PlanetaryBodyService from "@services/planetaryBody.service";
import SurfaceMaterialService from "@services/surfaceMaterial.service";
import MarketService from "@services/market.service";

@Service()
export default class StreamService {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    private dataSource: DataSource,
    @Inject("logger") private logger: Logger,
    private url: string = config.streamUrl
  ) {}

  public connect(): Subscriber {
    const socket = new Subscriber();

    socket.connect(this.url);
    socket.subscribe("");

    this.logger.info("EDDN subscriber connected to %s", this.url);
    return socket;
  }

  public async Run(): Promise<void> {
    const socket: Subscriber = this.connect();

    this.listen(socket);
  }

  private *scanCountGenerator() {
    let count = 0;
    while (true) {
      yield count++;
    }
  }

  public async listen(socket: Subscriber): Promise<void> {
    // await Container.get(MarketService).getCurrentMarket(128004608);

    for await (const [src] of socket) {
      try {
        const [event, data] = this.extractDataFromSocketSource(src);

        switch (event) {
          case "FSSDiscoveryScan": {
            break;
          }
          case "SAASignalsFound": {
            // this.logger.info("SAA Signals Found: %o", data);
            break;
          }
          case "commodity": {
            // data.commodities = data.commodities.slice(0, 2);
            // this.logger.info("Commodity: %o", data);
            this.logger.info("ADDING DATA FOR %s", data.marketId);
            const marketService: MarketService = Container.get(MarketService);
            await marketService.findOrCreateMarket(data);
            break;
          }
          case "Location": {
            // await this.handleLocationEvent(data);
            break;
          }
          case "Docked": {
            // await this.handleDockedEvent(data);
            break;
          }
          case "FSDJump": {
            // await this.handleFSDJumpEvent(data);
            break;
          }
          case "Scan": {
            // await this.handleScan(data);
            break;
          }
          case "ScanBaryCentre": {
            // await this.handleScanBarycenter(data);
            break;
          }
          default:
            // this.logger.info("EVENT: %s", event);
            break;
        }
      } catch (error) {
        // this.logger.error("An error occurred while listening to EDDN datastream: %o", error);
      }
    }
  }

  public async handleScan(data: ScanData): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
      await this.processScan(data, transaction);
    });
  }

  private async processScan(data: ScanData, transaction: EntityManager): Promise<void> {
    const params: CelestialBodyParams = CelestialBody.convertScan(data);
    const celestialBodyService = new CelestialBodyService(transaction);
    await celestialBodyService.findOrCreate(params);
    if (data.StarType) {
      await this.findOrCreateStar(data, transaction);
    } else if (data.PlanetClass) {
      await this.findOrCreatePlanet(data, transaction);
      // this.logger.info("PLANET SCAN: %o", data);
      /**
       * @TODO - Planet Creation
       */
    } else {
      await this.findOrCreateBeltCluster(data, transaction);
    }
  }

  private async findOrCreatePlanet(data: ScanData, transaction: EntityManager): Promise<void> {
    const planetService = new PlanetaryBodyService(transaction);
    const params = PlanetaryBody.convertScan(data as PlanetScanData);
    await planetService.findOrCreate(params, transaction);
    if (params.surfaceMaterials)
      await this.upsertSurfaceMaterials(params.surfaceMaterials, transaction);
  }

  private async upsertSurfaceMaterials(
    params?: SurfaceMaterialParams[],
    transaction?: EntityManager
  ): Promise<void> {
    if (params) {
      const service: SurfaceMaterialService = new SurfaceMaterialService(
        transaction || this.dataSource
      );
      await service.findOrCreate(params, transaction);
    }
  }

  private async findOrCreateBeltCluster(data: ScanData, transaction: EntityManager): Promise<void> {
    if (!data.Parents) return;
    const params = BeltCluster.convertScan(data);
    const asteroidBeltService = new AsteroidBeltService(transaction);
    const parentBeltName = extractBeltName(data.BodyName);
    await asteroidBeltService.updateBeltIdByName(parentBeltName, params.beltId);
    const beltClusterService = new BeltClusterService(transaction);
    await beltClusterService.findOrCreate(params);
  }

  private async findOrCreateStar(data: ScanData, transaction: EntityManager): Promise<void> {
    // this.logger.info("STAR SCAN: %o", data);
    const stellarBodyService = new StellarBodyService(transaction);
    const stellarBodyParams: StellarBodyParams = StellarBody.convertScan(data as StarScanData);
    const star = await stellarBodyService.findOrCreate(stellarBodyParams);
    const asteroidBeltService: AsteroidBeltService = new AsteroidBeltService(transaction);
    const ringParams = Ring.convertScan(data);
    for (const ring of ringParams) {
      await asteroidBeltService.findOrCreate({
        starId: star.bodyId as number,
        systemAddress: star.systemAddress as number,
        ring
      });
    }
  }

  public async handleScanBarycenter(data: ScanBarycentreData): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
      await this.processBarycenter(data, transaction);
    });
  }

  private async processBarycenter(
    data: ScanBarycentreData,
    transaction: EntityManager
  ): Promise<void> {
    const params: CelestialBodyParams = CelestialBody.convertScanBarycentre(data);
    const celestialBodyService = new CelestialBodyService(transaction);
    await celestialBodyService.findOrCreate(params);
  }

  public async handleLocationEvent(data: any): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
      if (data.Docked) await this.processStation(data as DockedData, transaction);

      await this.processStarSystem(data as FSDJumpData, transaction);
    });
  }

  public async handleDockedEvent(data: DockedData): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
      await this.processStation(data, transaction);
    });
  }

  public async handleFSDJumpEvent(data: FSDJumpData): Promise<void> {
    return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
      await this.processStarSystem(data, transaction);
    });
  }

  private async processStation(data: DockedData, transaction: EntityManager): Promise<void> {
    const params = Station.convertDocked(data);
    const stationService: StationService = Container.get(StationService);
    const station = await stationService.setDataSource(transaction).findOrCreate(params);
    const stationEconomyService: StationEconomyService = new StationEconomyService(transaction);
    for (const stationEconomy of params.stationEconomies) {
      await stationEconomyService.findOrCreate({ stationId: station.id, ...stationEconomy });
    }
  }

  private async processStarSystem(data: FSDJumpData, transaction: EntityManager): Promise<void> {
    const systemService: StarSystemService = new StarSystemService(transaction);
    const system: StarSystem = await systemService.findOrCreate(StarSystem.convertFSDJump(data));

    if (data.Factions) {
      const systemFactionService: SystemFactionService = new SystemFactionService(transaction);
      const params: SystemFactionParams[] = SystemFaction.convertFSDJump(data);
      const systemFactions: SystemFaction[] = (await systemFactionService.findOrCreate(
        params
      )) as SystemFaction[];
      await systemFactionService.clearInactiveSystemFactions(system, systemFactions);
    }

    if (data.ThargoidWar) {
      const thargoidWarService: ThargoidWarService = new ThargoidWarService(transaction);
      await thargoidWarService.findOrCreate(ThargoidWar.convertFSDJump(data));
    }

    if (data.Conflicts) {
      const systemConflictService: SystemConflictService = new SystemConflictService(transaction);
      await systemConflictService.findOrCreate(SystemConflict.convertFSDJump(data));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public extractDataFromSocketSource(source: Buffer): [string, any] {
    const msg = JSON.parse(zlib.inflateSync(source).toString());

    const event: string = msg.message.event
      ? msg.message.event
      : this.getImpliedEvent(msg["$schemaRef"]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = msg.message;

    return [event, data];
  }

  private getImpliedEvent(schemaRef: string) {
    return schemaRef.split("/")[4];
  }
}
