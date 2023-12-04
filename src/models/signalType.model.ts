// import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import SignalOnPlanet from "./signalOnPlanet.model";

// @Entity("signals")
// export default class Signal {
//   @PrimaryGeneratedColumn()
//   public id?: number;

//   @Index({ unique: true })
//   @Column()
//   public type?: string;

//   @Index({ unique: true })
//   @Column({ name: "localised_type" })
//   public localisedType?: string;

//   @OneToMany(() => SignalOnPlanet, (signalOnPlanet) => signalOnPlanet.signalType)
//   public planetsWithSignal?: SignalOnPlanet[];
// }
