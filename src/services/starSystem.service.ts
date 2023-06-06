import {
  Allegiance,
  Faction,
  FactionState,
  Government,
  Power,
  PowerplayState,
  PrimarySystemFaction,
  SecurityLevel,
  StarSystem,
  SystemEconomy
} from "@models/index";
import { Inject, Service } from "typedi";
import DatabaseService from "./database.service";
import { DataSource, EntityManager } from "typeorm";
import SystemCoordinatesService from "./systemCoordinates.service";
import SystemEconomyService from "./systemEconomy.service";

@Service()
export default class StarSystemService extends DatabaseService<StarSystem> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: DataSource | EntityManager
  ) {
    super(dataSource, StarSystem);
  }

  public async findOrCreate(data: StarSystemParams): Promise<StarSystem> {
    try {
      const { systemAddress } = data;
      let starSystem: StarSystem | null = await this.repository.findOne({
        where: {
          systemAddress
        },
        relations: {
          systemFactions: true
        }
      });

      const { systemCoordinates, systemName, createdAt, updatedAt } = data;
      if (!starSystem) {
        starSystem = this.repository.create({ systemAddress, systemName, createdAt, updatedAt });
      }

      await Promise.all([
        this.upsertSystemCoordinates(starSystem, systemCoordinates),
        this.upsertSystemEconomy(starSystem, data.systemEconomy),
        this.upsertSystemAllegiance(starSystem, data.allegiance),
        this.upsertSystemGovernment(starSystem, data.government),
        this.upsertPrimarySystemFaction(starSystem, data.primarySystemFaction),
        this.upsertSystemSecurity(starSystem, data.securityLevel),
        this.upsertPowerplayState(starSystem, data.powerplayState),
        this.upsertSystemPowers(starSystem, data.systemPowers)
      ]);

      await this.repository.save(starSystem);

      return starSystem;
    } catch (error) {
      this.logger.error("Error thrown while running StarSystemService.findOrCreate: %o", error);
      throw error;
    }
  }

  private async upsertSystemPowers(starSystem: StarSystem, systemPowers?: string[]): Promise<void> {
    if (systemPowers && systemPowers.length) {
      const { systemAddress } = starSystem;
      if (starSystem.systemPowers?.length)
        await this.repository
          .createQueryBuilder()
          .delete()
          .from("system_powers")
          .where(`system_address = :systemAddress`, { systemAddress })
          .execute();

      starSystem.systemPowers = await Promise.all(
        systemPowers.map(
          (power: string): Promise<Power> => this.findOrCreateEntity(Power, { powerName: power })
        )
      );
    }
  }

  private async upsertPowerplayState(
    starSystem: StarSystem,
    powerplayState?: string
  ): Promise<void> {
    if (powerplayState) {
      starSystem.powerplayState = await this.findOrCreateEntity(PowerplayState, { powerplayState });
    }
  }

  private async upsertSystemSecurity(
    starSystem: StarSystem,
    securityLevel?: string
  ): Promise<void> {
    if (securityLevel) {
      const record: SecurityLevel = await this.findOrCreateEntity(SecurityLevel, { securityLevel });
      starSystem.securityLevel = record;
    }
  }

  private async upsertPrimarySystemFaction(
    starSystem: StarSystem,
    systemFaction?: PrimarySystemFactionParams
  ): Promise<void> {
    if (systemFaction) {
      const { faction: factionName, factionState: factionStateName, systemAddress } = systemFaction;
      const faction: Faction = await this.findOrCreateEntity(Faction, { factionName });
      let factionState: FactionState | undefined = undefined;
      if (factionStateName)
        factionState = await this.findOrCreateEntity(FactionState, {
          factionState: factionStateName
        });

      const record: PrimarySystemFaction = await this.findOrCreateEntity(
        PrimarySystemFaction,
        {
          systemAddress
        },
        { systemAddress, faction, factionState }
      );

      starSystem.primaryFaction = record;
    }
  }

  private async upsertSystemAllegiance(starSystem: StarSystem, allegiance?: string): Promise<void> {
    if (allegiance) {
      // const record: Allegiance = await this.findOrCreateEntity(Allegiance, { allegiance });
      // starSystem.allegiance = record;
    }
  }

  private async upsertSystemGovernment(starSystem: StarSystem, government?: string): Promise<void> {
    if (government) {
      // const record: Government = await this.findOrCreateEntity(Government, { government });
      // starSystem.government = record;
    }
  }

  private async upsertSystemEconomy(
    starSystem: StarSystem,
    systemEconomy?: SystemEconomyParams
  ): Promise<void> {
    if (systemEconomy) {
      const record: SystemEconomy = await this.getService(SystemEconomyService).findOrCreate(
        systemEconomy
      );
      starSystem.systemEconomy = record;
    }
  }

  private async upsertSystemCoordinates(
    starSystem: StarSystem,
    coordinates?: SystemCoordinatesParams
  ): Promise<void> {
    if (coordinates) {
      const record = await this.getService(SystemCoordinatesService).findOrCreate(coordinates);
      starSystem.systemCoordinates = record;
    }
  }
}
