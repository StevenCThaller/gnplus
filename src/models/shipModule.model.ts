import { Entity, PrimaryColumn } from "typeorm";

@Entity("ship_module")
export default class ShipModule {
  @PrimaryColumn({ name: "module_id" })
  public moduleId?: string;
}
