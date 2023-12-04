import Container, { Service, Inject } from "typedi";
import zlib from "zlib";
import { Subscriber } from "zeromq";
import { Logger } from "winston";
import config from "@config/index";
import { DataSource } from "typeorm";
import MarketService from "@services/market.service";
import FSDJumpService from "@services/fsdjump.service";
import DockService from "@services/dock.service";
import ScanService from "@services/scan.service";
import fs from "fs";
import path from "path";
import OutfittingService from "@services/outfitting.service";

@Service()
export default class StreamService {
  private events: { [event: string]: any } = {};
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

  private addEvent(event: string, data: any): void {
    if (!this.events[event]) {
      this.events[event] = data;
    } else {
      this.events[event] = { ...this.events[event], ...data };
    }
    this.saveEvents();
  }

  private saveEvents(): void {
    const filePath = path.join(__dirname, "..", "..", "..", "eventData", "all_events.json");
    fs.writeFile(filePath, JSON.stringify(this.events), (err: any) => {
      if (err) this.logger.error("nu");
    });
  }

  public async listen(socket: Subscriber): Promise<void> {
    // await Container.get(MarketService).getCurrentMarket(128004608);

    for await (const [src] of socket) {
      // this.logger.info("Event at %o", new Date());
      const [event, data] = this.extractDataFromSocketSource(src);
      this.addEvent(event, data);
      try {
        switch (event) {
          case "FSSDiscoveryScan": {
            // this.logger.info("FSS DISCOVERY: %o", data);
            break;
          }
          case "SAASignalsFound": {
            // this.logger.info("SAA Signals Found: %o", data);
            break;
          }
          case "commodity": {
            // console.time("Commodity Event\t");
            await Container.get(MarketService).updateOrCreateMarket(data);
            // console.timeEnd("Commodity Event\t");

            break;
          }
          case "Location": {
            // await this.handleLocationEvent(data);
            break;
          }
          case "Docked": {
            // await this.handleDockedEvent(data);
            // console.time("Docked Event\t");
            await Container.get(DockService).updateOrCreateStation(data);
            // console.timeEnd("Docked Event\t");

            break;
          }
          case "FSDJump": {
            // await this.handleFSDJumpEvent(data);
            // console.time("FSDJump Event\t");
            await Container.get(FSDJumpService).updateOrCreateStarSystem(data);
            // console.timeEnd("FSDJump Event\t");

            break;
          }
          case "Scan": {
            // console.time("Scan Event\t");
            await Container.get(ScanService).updateOrInsertCelestialBody(data);
            // console.timeEnd("Scan Event\t");
            break;
          }
          case "ScanBaryCentre": {
            // await this.handleScanBarycenter(data);
            break;
          }
          case "FSSSignalDiscovered": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // if (data.signals.every((signal: any): boolean => !signal.IsStation))
            //   this.logger.info("FSS Signal Discovered: %o", data);
            break;
          }
          case "FSSAllBodiesFound": {
            // this.logger.info("FSS ALL BODIES FOUND: %o", data);
            break;
          }
          case "FSSBodySignals": {
            // this.logger.info("FSS BODY SIGNALS: %o", data);
            break;
          }
          case "outfitting": {
            console.log("OUTFITTING: ", data);
            await Container.get(OutfittingService).updateOrCreateShipModules(data);
            break;
          }
          default:
            // this.logger.info("NON HANDLED EVENT: %s", event);

            // this.logger.info("EVENT: %s", event);
            break;
        }
      } catch (error) {
        this.logger.error("An error occurred while listening to EDDN datastream: %o", error);
        this.logger.error("Input Data In Question: %o", data);
        if (event === "commodity") console.timeEnd("Commodity Event\t");
        if (event === "Docked") console.timeEnd("Docked Event\t");
        if (event === "FSDJump") console.timeEnd("FSDJump Event\t");
      }
    }
  }

  // public async handleScan(data: ScanData): Promise<void> {
  //   return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
  //     await this.processScan(data, transaction);
  //   });
  // }

  // private async processScan(data: ScanData, transaction: EntityManager): Promise<void> {
  //   const params: CelestialBodyParams = CelestialBody.convertScan(data);
  //   const celestialBodyService = new CelestialBodyService(transaction);
  //   await celestialBodyService.findOrCreate(params);
  //   if (data.StarType) {
  //     await this.findOrCreateStar(data, transaction);
  //   } else if (data.PlanetClass) {
  //     await this.findOrCreatePlanet(data, transaction);
  //     // this.logger.info("PLANET SCAN: %o", data);
  //     /**
  //      * @TODO - Planet Creation
  //      */
  //   } else {
  //     await this.findOrCreateBeltCluster(data, transaction);
  //   }
  // }

  // private async findOrCreatePlanet(data: ScanData, transaction: EntityManager): Promise<void> {
  //   const planetService = new PlanetaryBodyService(transaction);
  //   const params = PlanetaryBody.convertScan(data as PlanetScanData);
  //   await planetService.findOrCreate(params, transaction);
  //   if (params.surfaceMaterials)
  //     await this.upsertSurfaceMaterials(params.surfaceMaterials, transaction);
  // }

  // private async upsertSurfaceMaterials(
  //   params?: SurfaceMaterialParams[],
  //   transaction?: EntityManager
  // ): Promise<void> {
  //   if (params) {
  //     const service: SurfaceMaterialService = new SurfaceMaterialService(
  //       transaction || this.dataSource
  //     );
  //     await service.findOrCreate(params, transaction);
  //   }
  // }

  // private async findOrCreateBeltCluster(data: ScanData, transaction: EntityManager): Promise<void> {
  //   if (!data.Parents) return;
  //   const params = BeltCluster.convertScan(data);
  //   const asteroidBeltService = new AsteroidBeltService(transaction);
  //   const parentBeltName = extractBeltName(data.BodyName);
  //   await asteroidBeltService.updateBeltIdByName(parentBeltName, params.beltId);
  //   const beltClusterService = new BeltClusterService(transaction);
  //   await beltClusterService.findOrCreate(params);
  // }

  // private async findOrCreateStar(data: ScanData, transaction: EntityManager): Promise<void> {
  //   // this.logger.info("STAR SCAN: %o", data);
  //   const stellarBodyService = new StellarBodyService(transaction);
  //   const stellarBodyParams: StellarBodyParams = StellarBody.convertScan(data as StarScanData);
  //   const star = await stellarBodyService.findOrCreate(stellarBodyParams);
  //   const asteroidBeltService: AsteroidBeltService = new AsteroidBeltService(transaction);
  //   const ringParams = Ring.convertScan(data);
  //   for (const ring of ringParams) {
  //     await asteroidBeltService.findOrCreate({
  //       starId: star.bodyId as number,
  //       systemAddress: star.systemAddress as number,
  //       ring
  //     });
  //   }
  // }

  // public async handleScanBarycenter(data: ScanBarycentreData): Promise<void> {
  //   return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
  //     await this.processBarycenter(data, transaction);
  //   });
  // }

  // private async processBarycenter(
  //   data: ScanBarycentreData,
  //   transaction: EntityManager
  // ): Promise<void> {
  //   const params: CelestialBodyParams = CelestialBody.convertScanBarycentre(data);
  //   const celestialBodyService = new CelestialBodyService(transaction);
  //   await celestialBodyService.findOrCreate(params);
  // }

  // public async handleLocationEvent(data: any): Promise<void> {
  //   return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
  //     if (data.Docked) await this.processStation(data as DockedData, transaction);

  //     await this.processStarSystem(data as FSDJumpData, transaction);
  //   });
  // }

  // public async handleDockedEvent(data: DockedData): Promise<void> {
  //   return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
  //     await this.processStation(data, transaction);
  //   });
  // }

  // public async handleFSDJumpEvent(data: FSDJumpData): Promise<void> {
  //   return this.dataSource.transaction(async (transaction: EntityManager): Promise<void> => {
  //     await this.processStarSystem(data, transaction);
  //   });
  // }

  // private async processStation(data: DockedData, transaction: EntityManager): Promise<void> {
  //   const params = Station.convertDocked(data);
  //   const stationService: StationService = Container.get(StationService);
  //   const station = await stationService.setDataSource(transaction).findOrCreate(params);
  //   const stationEconomyService: StationEconomyService = new StationEconomyService(transaction);
  //   for (const stationEconomy of params.stationEconomies) {
  //     await stationEconomyService.findOrCreate({ stationId: station.id, ...stationEconomy });
  //   }
  // }

  // private async processStarSystem(data: FSDJumpData, transaction: EntityManager): Promise<void> {
  //   const systemService: StarSystemService = new StarSystemService(transaction);
  //   const system: StarSystem = await systemService.findOrCreate(StarSystem.convertFSDJump(data));

  //   if (data.Factions) {
  //     const systemFactionService: SystemFactionService = new SystemFactionService(transaction);
  //     const params: SystemFactionParams[] = SystemFaction.convertFSDJump(data);
  //     const systemFactions: SystemFaction[] = (await systemFactionService.findOrCreate(
  //       params
  //     )) as SystemFaction[];
  //     await systemFactionService.clearInactiveSystemFactions(system, systemFactions);
  //   }

  //   if (data.ThargoidWar) {
  //     const thargoidWarService: ThargoidWarService = new ThargoidWarService(transaction);
  //     await thargoidWarService.findOrCreate(ThargoidWar.convertFSDJump(data));
  //   }

  //   if (data.Conflicts) {
  //     const systemConflictService: SystemConflictService = new SystemConflictService(transaction);
  //     await systemConflictService.findOrCreate(SystemConflict.convertFSDJump(data));
  //   }
  // }

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
