import { Injectable } from "@nestjs/common";
import Station from "@api/models/station.model";
import { DataSource, EntityManager, Repository } from "typeorm";
import BaseService from ".";
import Container, { Inject, Service } from "typedi";
import { AppDataSource } from "@datasource";
import ServiceOffered from "@api/models/serviceOffered.model";
import Government from "@api/models/government.model";
import { Logger } from "winston";

@Service()
export class StationRepository extends BaseService<Station> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Station, dataSource);
  }

  public async findByMarketId(marketId: number): Promise<Station | null> {
    return this.repository.findOne({ where: { marketId } });
  }

  public async findOneOrCreate(
    systemAddress: number,
    marketId: number,
    stationName: string,
    distanceFromArrival: number,
    createdAt: Date,
    updatedAt: Date
  ): Promise<any> {
    return super._findOneOrCreate(
      {
        marketId
      },
      {
        marketId,
        systemAddress,
        stationName,
        distanceFromArrival,
        createdAt,
        updatedAt
      }
    );
  }
}
