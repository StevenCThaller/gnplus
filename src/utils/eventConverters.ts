import { hasOwnProperty } from "./prototypeHelpers";

interface AllegianceParams {
  allegiance: string;
}

export function toAllegiance(data: EDDNEvent): AllegianceParams | undefined {
  if (hasOwnProperty(data, "StationAllegiance"))
    return { allegiance: (data as DockedData).StationAllegiance as string };
  else if (hasOwnProperty(data, "SystemAllegiance"))
    return { allegiance: (data as FSDJumpData).SystemAllegiance as string };
  else return { allegiance: "Independent" };
}

export interface GovernmentParams {
  government: string;
}
export function toGovernment(data: EDDNEvent): GovernmentParams | undefined {
  if (hasOwnProperty(data, "StationGovernment"))
    return { government: (data as DockedData).StationGovernment };
  else if (hasOwnProperty(data, "SystemGovernment"))
    return { government: (data as FSDJumpData).SystemGovernment };
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
    isEventLandingPadConfig((data as DockedData).LandingPads)
  ) {
    padConfig = (data as DockedData).LandingPads as EventLandingPads;
  } else if (isEventLandingPadConfig((data as DockedData).LandingPads)) {
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

interface FactionStateParams {
  factionState: string;
}

type ActiveStateParams = FactionStateParams;

interface TrendingStateParams extends FactionStateParams {
  trend: number;
}
type RecoveringStateParams = TrendingStateParams;
type PendingStateParams = TrendingStateParams;

export type SystemFactionParams = {
  allegiance: string;
  factionState: string;
  government: string;
  happiness: string;
  influence: number;
  faction: string;
  recoveringStates?: RecoveringStateParams[];
  activeStates?: ActiveStateParams[];
  pendingStates?: PendingStateParams[];
};

interface PrimarySystemFaction {
  faction: string;
  state?: string;
}

type ConflictFactionParams = {
  faction: string;
  stake: string;
  wonDays: number;
};

type SystemConflictParams = {
  factionOne: ConflictFactionParams;
  factionTwo: ConflictFactionParams;
  status: string;
  warType: string;
};

export type ThargoidWarParams = {
  systemAddress: number;
  currentState: string;
  estimatedRemainingTime: string;
  nextStateFailure: string;
  nextStateSuccess: string;
  remainingPorts: number;
  successStateReached: boolean;
  warProgress: number;
};

interface StarSystemParams {
  systemAddress: number;
  systemName: string;
  systemCoordinates: SystemCoordinatesParams | number;
  population?: number;
  systemAllegiance?: string;
  primaryEconomy?: string;
  secondaryEconomy?: string;
  government?: string;
  securityLevel?: string;
  factions?: SystemFactionParams[];
  powerplayState?: string;
  powers?: string[];
  systemFaction?: PrimarySystemFaction;
  conflicts?: SystemConflictParams[];
  thargoidWar?: ThargoidWarParams;
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

export function toStation(data: DockedData): StationParams {
  return {
    marketId: data.MarketID,
    systemAddress: data.SystemAddress,
    stationName: data.StationName,
    distanceFromArrival: data.DistFromStarLS,
    createdAt: new Date(data.timestamp),
    updatedAt: new Date(data.timestamp)
  };
}

export function toStationEconomies(data: DockedData): StationEconomyParams[] {
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
  if (!hasOwnProperty(data, "Body")) {
    data = data as DockedData;
    return {
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      systemCoordinates: toSystemCoordinates(data) as SystemCoordinatesParams
    };
  } else {
    data = data as FSDJumpData;
    return {
      systemAddress: data.SystemAddress,
      systemName: data.StarSystem,
      systemCoordinates: toSystemCoordinates(data) as SystemCoordinatesParams,
      population: data.Population,
      systemAllegiance: data.SystemAllegiance,
      primaryEconomy: data.SystemEconomy,
      secondaryEconomy: data.SystemSecondEconomy,
      government: data.SystemGovernment,
      securityLevel: data.SystemSecurity,
      factions: toSystemFactionArr(data),
      powers: data.Powers || [],
      powerplayState: data.PowerplayState,
      thargoidWar: toThargoidWar(data),
      conflicts: toConflicts(data)
    };
  }
}

export function toConflicts(data: FSDJumpData): SystemConflictParams[] {
  if (!hasOwnProperty(data, "Conflicts")) return [];

  return (
    data.Conflicts?.map(
      (faction: SystemConflict): SystemConflictParams => ({
        factionOne: {
          faction: faction.Faction1.Name,
          stake: faction.Faction1.Stake,
          wonDays: faction.Faction1.WonDays
        },
        factionTwo: {
          faction: faction.Faction2.Name,
          stake: faction.Faction2.Stake,
          wonDays: faction.Faction2.WonDays
        },
        status: faction.Status,
        warType: faction.WarType
      })
    ) || []
  );
}

export function toThargoidWar(
  data: FSDJumpData
): ThargoidWarParams | undefined {
  if (!hasOwnProperty(data, "ThargoidWar")) return;

  return {
    systemAddress: data.SystemAddress,
    currentState: data.ThargoidWar.CurrentState,
    estimatedRemainingTime: data.ThargoidWar.EstimatedRemainingTime,
    nextStateFailure: data.ThargoidWar.NextStateFailure,
    nextStateSuccess: data.ThargoidWar.NextStateSuccess,
    remainingPorts: data.ThargoidWar.RemainingPorts,
    successStateReached: data.ThargoidWar.SuccessStateReached,
    warProgress: data.ThargoidWar.WarProgress
  };
}

export function toSystemFactionArr(data: FSDJumpData): SystemFactionParams[] {
  if (!hasOwnProperty(data, "Factions")) return [];

  return (
    data.Factions?.map(
      (faction: SystemFactionJump): SystemFactionParams => ({
        allegiance: faction.Allegiance,
        factionState: faction.FactionState,
        government: faction.Government,
        happiness: faction.Happiness,
        influence: faction.Influence,
        faction: faction.Name,
        recoveringStates:
          faction.RecoveringStates?.map(
            (rs: RecoveringState): RecoveringStateParams => ({
              factionState: rs.State,
              trend: rs.Trend
            })
          ) || [],
        activeStates:
          faction.ActiveStates?.map(
            (rs: ActiveState): ActiveStateParams => ({
              factionState: rs.State
            })
          ) || [],
        pendingStates:
          faction.PendingStates?.map(
            (rs: PendingState): PendingStateParams => ({
              factionState: rs.State,
              trend: rs.Trend
            })
          ) || []
      })
    ) || []
  );
}

export function toStationState(data: DockedData): string {
  return data.StationState ? data.StationState : "---";
}

export function toEconomies(data: EDDNEvent): string[] {
  const economies: string[] = [];

  if (hasOwnProperty(data, "StationEconomy"))
    economies.push((data as DockedData).StationEconomy);

  if (hasOwnProperty(data, "StationEconomies"))
    economies.push(
      ...(data as DockedData).StationEconomies.map((sE: any): string => sE.Name)
    );

  return economies;
}
