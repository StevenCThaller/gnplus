import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  BaseEntity
} from "typeorm";
import Station from "./station";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import StarSystem from "./starSystem";
import SystemFaction from "./systemFaction";

@Entity("allegiances")
export default class Allegiance extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  @Index({ unique: true })
  public allegiance!: string;

  @OneToMany(() => Station, (station) => station.allegiance, {
    cascade: ["insert"]
  })
  public stations!: Station[];

  @OneToMany(() => StarSystem, (starSystem) => starSystem.allegiance, {
    cascade: ["insert"]
  })
  public systems!: StarSystem[];

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.allegiance, {
    cascade: ["insert"]
  })
  public systemFactions!: SystemFaction[];
}
