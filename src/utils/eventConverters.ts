import StationEconomy from "@api/models/stationEconomy";
import { hasOwnProperty } from "./prototypeHelpers";

interface AllegianceParams {
  allegiance: string;
}

export function toAllegiance(data: EDDNEvent): AllegianceParams | undefined {
  if (hasOwnProperty(data, "StationAllegiance"))
    return { allegiance: data.StationAllegiance as string };
  else return { allegiance: "Independent" };
}

export interface GovernmentParams {
  government: string;
}
export function toGovernment(data: EDDNEvent): GovernmentParams | undefined {
  if (hasOwnProperty(data, "StationGovernment"))
    return { government: data.StationGovernment };
}

export function toStationType(data: DockedData): string {
  return data.StationType;
}

interface LandingPadConfigParams {
  small: number;
  medium: number;
  large: number;
}

export function isEventLandingPadConfig(
  data: unknown
): data is LandingPadConfigParams {
  return (
    hasOwnProperty(data, "Small") &&
    hasOwnProperty(data, "Medium") &&
    hasOwnProperty(data, "Large")
  );
}

export function toLandingPadConfig(
  data: EDDNEvent | EventLandingPads
): LandingPadConfigParams | undefined {
  let padConfig: EventLandingPads;
  if (
    hasOwnProperty(data, "LandingPads") &&
    isEventLandingPadConfig((data as EDDNEvent).LandingPads)
  ) {
    padConfig = (data as EDDNEvent).LandingPads as EventLandingPads;
  } else if (isEventLandingPadConfig((data as EDDNEvent).LandingPads)) {
    padConfig = data as EventLandingPads;
  } else {
    return;
  }

  return {
    small: padConfig.Small,
    medium: padConfig.Medium,
    large: padConfig.Large
  };
}

interface SystemCoordinatesParams {
  x: number;
  y: number;
  z: number;
}
export function toSystemCoordinates(
  data: EDDNEvent | number[]
): SystemCoordinatesParams | undefined {
  let starPos: number[];
  if (!Array.isArray(data) && hasOwnProperty(data, "StarPos")) {
    starPos = data.StarPos;
  } else if (
    Array.isArray(data) &&
    data.every((element: any): boolean => typeof element === "number")
  ) {
    starPos = data;
  } else {
    return;
  }

  return { x: starPos[0], y: starPos[1], z: starPos[2] };
}

interface StarSystemParams {
  systemAddress: number;
  systemName: string;
  systemCoordinates: SystemCoordinatesParams | number;
}

export interface EconomyParams {
  economyName: string;
}

export interface StationEconomyParams {
  stationId: number;
  economyId: number | EconomyParams;
  proportion: number;
}

interface StationParams {
  marketId: number;
  systemAddress: number;
  stationName: string;
  distanceFromArrival: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toStation(data: EDDNEvent): StationParams {
  return {
    marketId: data.MarketID,
    systemAddress: data.SystemAddress,
    stationName: data.StationName,
    distanceFromArrival: data.DistFromStarLS,
    createdAt: new Date(data.timestamp),
    updatedAt: new Date(data.timestamp)
  };
}

export function toStationEconomies(data: EDDNEvent): StationEconomyParams[] {
  const stationEconomiesParams: StationEconomyParams[] =
    data.StationEconomies.map(
      (sE: DockedStationEconomy): StationEconomyParams => ({
        stationId: data.MarketID,
        economyId: { economyName: sE.Name },
        proportion: sE.Proportion
      })
    );

  return stationEconomiesParams;
}

export function toStarSystem(data: EDDNEvent): StarSystemParams {
  return {
    systemAddress: data.SystemAddress,
    systemName: data.StarSystem,
    systemCoordinates: toSystemCoordinates(data) as SystemCoordinatesParams
  };
}

export function toStationState(data: EDDNEvent): string {
  return data.StationState ? data.StationState : "---";
}

export function toEconomies(data: EDDNEvent): string[] {
  const economies: string[] = [];

  if (hasOwnProperty(data, "StationEconomy"))
    economies.push(data.StationEconomy);

  if (hasOwnProperty(data, "StationEconomies"))
    economies.push(...data.StationEconomies.map((sE: any): string => sE.Name));

  return economies;
}
