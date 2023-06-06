import Container, { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import PlanetaryBody from "@models/planetaryBody.model";
import { DataSource, EntityManager } from "typeorm";
import PlanetClass from "@models/planetClass.model";
import PlanetAtmosphere from "@models/planetAtmosphere.model";
import PlanetAtmosphereService from "./planetAtmosphere.service";
import PlanetComposition from "@models/planetComposition.model";
import TerraformState from "@models/terraformState.model";
import Volcanism from "@models/volcanism.model";
import PlanetarySurfaceDetails from "@models/planetarySurfaceDetails.model";
import SurfaceMaterial from "@models/surfaceMaterial.model";
import Material from "@models/material.model";
import PlanetCompositionService from "./planetComposition.service";

@Service()
export default class PlanetaryBodyService extends DatabaseService<PlanetaryBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, PlanetaryBody);
    this.repository = this.dataSource.getRepository(PlanetaryBody);
  }

  public async findOrCreate(
    params: PlanetaryBodyParams,
    manager?: EntityManager
  ): Promise<PlanetaryBody> {
    let repo = this.repository;
    if (manager) {
      repo = manager.getRepository(PlanetaryBody);
    }
    const {
      bodyId,
      system: { systemAddress }
    } = params;
    if (bodyId == undefined || systemAddress == undefined) {
      this.logger.info("AKLSDKFLJKSLDJFKLJSDFKL: %o", params);
    }
    let record: PlanetaryBody | null = await repo.findOne({ where: { bodyId, systemAddress } });
    try {
      if (!record) {
        const planetClass = await this.findOrCreateEntity(PlanetClass, {
          className: params.planetClass
        });
        record = repo.create({
          bodyId,
          systemAddress,
          planetClassId: planetClass.id
        });

        // repo.merge(record);
      }
      await Promise.all([
        await this.upsertPlanetAtmosphere(record, params.planetAtmosphere, manager),
        await this.upsertPlanetComposition(record, params.planetComposition),
        await this.upsertSurfaceDetails(record, params.surfaceDetails)
      ]);
      await repo.save(record);

      return record;
    } catch (error) {
      // this.logger.error("ERROR WHEN SAVING PLANET: ");
      // const keys = Object.keys(params);
      // this.logger.error("ATTEMPTING TO SAVE DATA WITH THE FOLLOWING KEYS: %o", keys);
      this.logger.error("Error thrown while running PlanetaryBodyService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertPlanetAtmosphere(
    record: PlanetaryBody,
    params?: PlanetAtmosphereParams,
    manager?: EntityManager
  ): Promise<void> {
    if (params) {
      await Container.get(PlanetAtmosphereService)
        .setDataSource(manager as EntityManager)
        .findOrCreate(params, manager);
    }
  }

  private async upsertPlanetComposition(
    record: PlanetaryBody,
    composition?: PlanetCompositionParams
  ): Promise<void> {
    if (composition) {
      const compositionRecord = await Container.get(PlanetCompositionService).findOrCreate(
        composition
      );
      record.planetCompositionId = compositionRecord.id;
    }
  }

  private async upsertSurfaceDetails(
    record: PlanetaryBody,
    params?: SurfaceDetailsParams
  ): Promise<void> {
    if (params) {
      let terraformState: TerraformState | undefined;
      if (params.terraformState)
        terraformState = await this.findOrCreateEntity(TerraformState, {
          stateName: params.terraformState
        });
      let volcanism: Volcanism | undefined;
      if (params.volcanism)
        volcanism = await this.findOrCreateEntity(Volcanism, { volcanism: params.volcanism });
      await this.findOrCreateEntity(
        PlanetarySurfaceDetails,
        {
          bodyId: params.bodyId,
          systemAddress: params.systemAddress
        },
        {
          ...params,
          terraformState,
          volcanism
        }
      );
    }
  }

  public override setDataSource(source: DataSource | EntityManager): PlanetaryBodyService {
    super.setDataSource(source);
    return this;
  }
}
