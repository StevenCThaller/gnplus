import StationFaction from "@api/models/stationFaction.model";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";
import FactionState from "@api/models/factionState.model";

@Service()
export default class StationFactionRepository extends BaseService<StationFaction> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(StationFaction, dataSource);
  }

  public async findOneAndUpdate(
    stationId: number,
    factionId: number,
    factionStateId?: number
  ): Promise<StationFaction | null> {
    const stationFaction = await this.repository.findOne({
      where: { stationId }
    });
    if (!stationFaction) return null;
    if (stationFaction.factionId !== factionId)
      stationFaction.factionId = factionId;
    if (factionStateId && stationFaction.factionStateId !== factionStateId)
      stationFaction.factionStateId = factionStateId;
    await this.repository.save(stationFaction);
    return stationFaction;
  }

  public async create(
    stationId: number,
    factionId: number,
    factionStateId: number
  ): Promise<StationFaction> {
    const stationFaction = this.repository.create({
      stationId,
      factionId,
      factionStateId
    });
    await this.repository.save(stationFaction);
    return stationFaction;
  }

  public async findOneOrCreate(
    stationId: number,
    factionId: number,
    factionStateId?: number
  ): Promise<StationFaction> {
    const result = await super._findOneOrCreate(
      { stationId },
      { stationId, factionId, factionStateId }
    );
    if (!result.id) await this.repository.save(result);
    return result;
  }
}
