import ServiceOffered from "@api/models/serviceOffered";
import { Service, Inject } from "typedi";
import BaseService from ".";
import { DataSource, EntityManager } from "typeorm";

@Service()
export default class ServiceOfferedService extends BaseService<ServiceOffered> {
  /**
   *
   */
  constructor(protected dataSource: EntityManager | DataSource) {
    super(ServiceOffered, dataSource);
  }

  public async findOneOrCreate(service: string): Promise<ServiceOffered> {
    return super._findOneOrCreate({ service }, { service });
  }

  public async bulkCreate(services: string[]): Promise<ServiceOffered[]> {
    return this.repository.create(
      services.map((service: string): { service: string } => ({ service }))
    );
  }
}
