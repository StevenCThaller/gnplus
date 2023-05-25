import { PlanetaryBody } from "@api/models";
import { Service, Inject } from "typedi";
import BaseRepository, { RepoManager } from "./base.repository";

@Service()
export default class PlanetaryBodyRepository extends BaseRepository<PlanetaryBody> {
  /**
   *
   */
  constructor(
    @Inject("dataSource")
    protected dataSource: RepoManager
  ) {
    super(PlanetaryBody, dataSource);
  }

  public async updateOneOrCreate(
    planetaryBody: OmitBaseEntity<PlanetaryBody>
  ): Promise<PlanetaryBody> {
    const { bodyId, systemAddress } = planetaryBody;
    let record: PlanetaryBody | null = await this.repository.findOne({
      where: { bodyId, systemAddress }
    });

    if (!record) return this.repository.create(planetaryBody);

    record = PlanetaryBody.merge(record, planetaryBody as PlanetaryBody);
    await this.repository.save(record);
    return record;
  }

  public async findOneOrCreate(
    planetaryBody: OmitBaseEntity<PlanetaryBody>
  ): Promise<PlanetaryBody> {
    const { bodyId, systemAddress } = planetaryBody;
    return await super._findOneOrCreate(
      { bodyId, systemAddress },
      planetaryBody
    );
  }
}
