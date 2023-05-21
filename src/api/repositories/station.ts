import { Service, Inject } from "typedi";
import { DataSource, Repository } from "typeorm";

import Station from "../models/station";
import Allegiance from "../models/allegiance";
import { Injectable } from "@nestjs/common";
import { AppDataSource } from "@datasource";

// @Service()
// export default class StationRepository extends Repository<Station> {
//   constructor(dataSource: DataSource = AppDataSource) {
//     super(Station, dataSource.createEntityManager());
//   }

//   public async findByMarketId(marketId: number): Promise<Station | null> {
//     return this.findOne({ where: { marketId: marketId } });
//   }
// }
