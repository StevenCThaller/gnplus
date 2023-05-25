import { Service } from "typedi";
import { DataSource, EntityManager } from "typeorm";
import BaseRepository from "./base.repository";
import { Material } from "@api/models";

@Service()
export default class MaterialRepository extends BaseRepository<Material> {
  constructor(protected dataSource: EntityManager | DataSource) {
    super(Material, dataSource);
  }

  public async findOneOrCreate(material: string): Promise<Material> {
    return super._findOneOrCreate({ material }, { material });
  }
}
