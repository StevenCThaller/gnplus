// import { StarSystem, SystemCoordinates } from "@api/models";
// import {
//   StarSystemRepository,
//   SystemCoordinatesRepository
// } from "@api/repositories";
// import { Inject, Service } from "typedi";
// import { DataSource, EntityManager } from "typeorm";
// import { Logger } from "winston";
// import TypeORMService from "./typeorm";
// import { hasOwnProperty } from "@utils/prototypeHelpers";

// @Service()
// export default class BasicSystemService extends TypeORMService {
//   constructor(
//     @Inject("dataSource")
//     protected dataSource: DataSource
//   ) {
//     super(dataSource);
//   }

//   /**
//    *
//    * @param systemAddress
//    * @param starSystem
//    * @param systemCoordinates
//    * @returns
//    */
//   protected async findOrCreateBaseSystem(
//     systemAddress: number,
//     starSystem: string,
//     systemCoordinates: SystemCoordinatesParams
//   ): Promise<StarSystem> {
//     const repo: StarSystemRepository = this.getRepo(StarSystemRepository);
//     const record: StarSystem = await repo.findOneOrCreateBase(
//       systemAddress,
//       starSystem
//     );
//     if (!record.createdAt) {
//       record.systemCoordinates = await this.findOrCreateSystemCoordinates(
//         systemCoordinates
//       );
//       await record.save();
//     }
//     return record;
//   }

//   /**
//    *
//    * @param coordinates
//    * @returns
//    */
//   public async findOrCreateSystemCoordinates(
//     coordinates: SystemCoordinatesParams
//   ): Promise<SystemCoordinates> {
//     if (!this.isSystemCoordinates(coordinates))
//       throw "Invalid data type. Coordinates must be an array of 3 numbers";
//     const repo: SystemCoordinatesRepository = this.getRepo(
//       SystemCoordinatesRepository
//     );
//     const [x, y, z] = coordinates;
//     const record = await repo.findOneOrCreate(x, y, z);
//     if (!record.hasId()) await repo.save(record);
//     return record;
//   }

//   private isSystemCoordinates(coordinates: any): boolean {
//     return (
//       Array.isArray(coordinates) &&
//       coordinates.length === 3 &&
//       coordinates.some((value: any): boolean => typeof value === "number")
//     );
//   }

//   /**
//    *
//    * @param repository - Repository service class
//    * @returns An actual repository service.
//    */
//   public getRepo<T>(repository: Newable<T>): T {
//     return new repository(this.manager || this.dataSource);
//   }
// }
