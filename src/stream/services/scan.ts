import PlanetaryBody from "@api/models/planetaryBody.model";
import StellarBody from "@api/models/stellarBody.model";
import BasicSystemService from "@stream/base/baseSystemHandler";
import { hasOwnProperty } from "@utils/prototypeHelpers";
import { Service, Inject } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import { Logger } from "winston";

@Service()
export default class ScanService extends BasicSystemService {
  private manager?: EntityManager;
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource
  ) {
    super(dataSource);
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

  public async updateOrCreatePlanet(data: PlanetScanData): Promise<void> {}

  public async updateOrCreateAsteroidBeltCluster(
    data: ScanData
  ): Promise<void> {}

  /**
   *
   * @param repository - Repository service class
   * @returns An actual repository service.
   */
  public getRepo<T>(repository: Newable<T>): T {
    return new repository(this.manager || this.dataSource);
  }
}
