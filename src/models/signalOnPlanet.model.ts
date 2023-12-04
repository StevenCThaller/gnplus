// import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
// import SignalType from "./signalType.model";
// import PlanetaryBody from "./planetaryBody.model";

// @Entity("signals_on_planet")
// @Index(["system_address", "body_id"], { unique: false })
// export default class SignalOnPlanet {
//   @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
//   public id?: number;

//   @Column({ name: "system_address", type: "bigint", unsigned: true })
//   public systemAddress?: number;

//   @Column({ name: "body_id" })
//   public bodyId?: number;

//   @ManyToOne(() => PlanetaryBody, (planet) => planet.signals)
//   public planet?: PlanetaryBody;

//   @Column({ name: "signal_id" })
//   @Index({ unique: true })
//   public signalTypeId?: number;
//   @ManyToOne(() => SignalType, (signalType) => signalType.planetsWithSignal)
//   public signalType?: SignalType;

//   @Column({ name: "signal_count" })
//   public signalCount?: number;

//   /**
//    * Timestamps
//    */
//   @Column({
//     name: "created_at",
//     nullable: false
//   })
//   public createdAt?: Date;

//   @Column({
//     name: "updated_at",
//     nullable: false,
//     onUpdate: "CURRENT_TIMESTAMP"
//   })
//   public updatedAt?: Date;
// }
