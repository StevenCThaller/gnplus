type LandingPadsParams = {
  small: number;
  medium: number;
  large: number;
};

type StationEconomyParams = {
  stationId?: number;
  economy: string;
  proportion: number;
};

type StationFactionParams = {
  faction: string;
  factionState: string;
};

type CreateStationParams = {
  stationName: string;
  id: number;
  distanceFromArrival?: number;
  allegiance?: string;
  government: string;
  stationType?: string;
  landingPads?: LandingPadsParams;
  stationState: string;
  system: SystemParams;
  stationFaction: StationFactionParams;
  stationEconomies: StationEconomyParams[];
  servicesAvailable: string[];
  createdAt: Date;
  updatedAt: Date;
};

type SystemCoordinatesParams = { x: number; y: number; z: number };

type SystemEconomyParams = {
  primaryEconomy: string;
  secondaryEconomy: string;
};

type PrimarySystemFactionParams = {
  systemAddress: number;
  faction: string;
  factionState?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ActiveStateParams = string;

type SystemFactionParams = {
  systemAddress: number;
  faction: string;
  factionState: string;
  allegiance: string;
  government: string;
  happinessLevel: string;
  influence: number;
  activeStates?: string[];
  pendingStates?: TrendingStateParams[];
  recoveringStates?: TrendingStateParams[];
};

type TrendingStateParams = {
  factionState?: string;
  trend: number;
};

type ThargoidWarParams = {
  systemAddress: number;
  remainingPorts: number;
  warProgress: number;
  estimatedRemainingTime?: string;
  successStateReached: boolean;
  currentState: string;
  nextStateFailure: string;
  nextStateSuccess: string;
  createdAt: Date;
  updatedAt: Date;
};

type ConflictFactionParams = {
  systemAddress: number;
  faction: string;
  stake: string;
  wonDays: number;
};

type SystemConflictParams = {
  systemAddress: number;
  factionOne: ConflictFactionParams;
  factionTwo: ConflictFactionParams;
  conflictStatus: string;
  warType: string;
  createdAt: Date;
  updatedAt: Date;
};

type BaseStarSystemParams = {
  systemAddress: number;
  systemName: string;
  systemCoordinates: SystemCoordinatesParams;
  timestamp: Date;
};

type StarSystemParams = BaseStarSystemParams & {
  // systemAddress: number;
  // systemName: string;
  // systemCoordinates: SystemCoordinatesParams;
  systemEconomy?: SystemEconomyParams;
  primarySystemFaction?: PrimarySystemFactionParams;
  population?: number;
  allegiance?: string;
  government?: string;
  securityLevel?: string;
  systemFactions?: SystemFactionParams[];
  powerplayState?: string;
  systemPowers?: string[];
  systemConflicts?: SystemConflictParams[];
  thargoidWar?: ThargoidWarParams;
};

type BarycenterParams = {
  bodyId: number;
  systemAddress: number;
  ascendingNode: number;
  meanAnomaly: number;
};

type OrbitParams = {
  bodyId: number;
  systemAddress: number;
  eccentricity: number;
  orbitalInclination: number;
  orbitalPeriod: number;
  periapsis: number;
  semiMajorAxis: number;
};

type RingParams = {
  bodyId: number;
  systemAddress: number;
  ringName: string;
  innerRadius: number;
  outerRadius: number;
  massMegatons: number;
  ringClass: string;
};

type RotationParametersParams = {
  bodyId: number;
  systemAddress: number;
  rotationPeriod: number;
  axialTilt: number;
  radius: number;
};

type AtmosphereCompositionParams = {
  planetAtmosphereId?: number;
  atmosphereType: string;
  percent: number;
};

type PlanetAtmosphereParams = {
  bodyId: number;
  systemAddress: number;
  atmosphere?: string;
  atmosphereType?: string;
  atmosphereComposition?: AtmosphereCompositionParams[];
};

type PlanetCompositionParams = {
  ice: number;
  rock: number;
  metal: number;
};

type SurfaceDetailsParams = {
  bodyId: number;
  systemAddress: number;
  massEM?: number;
  tidalLock?: boolean;
  landable?: boolean;
  surfaceGravity?: number;
  surfacePressure?: number;
  surfaceTemperature?: number;
  terraformState?: string;
  volcanism?: string;
};

type RingedBodyParams = {
  bodyId: number;
  systemAddress: number;
  reserves?: string;
  rings: RingParams[];
  timestamp: Date;
};

type PlanetaryBodyParams = CelestialBodyParams & {
  planetClass: string;
  planetAtmosphere?: PlanetAtmosphereParams;
  planetComposition?: PlanetCompositionParams;
  surfaceDetails: SurfaceDetailsParams;
  ringedBody?: RingedBodyParams;
  surfaceMaterials?: SurfaceMaterialParams[];
};

type SurfaceMaterialParams = {
  bodyId: number;
  systemAddress: number;
  material: string;
  percent: number;
};

type CelestialBodyParams = {
  bodyId: number;
  system: StarSystemParams;
  bodyName?: string;
  distanceFromArrival?: number;
  bodyType?: string;
  parentBodyId?: number;
  orbit?: OrbitParams;
  barycenter?: BarycenterParams;
  rings?: Ring[];
  rotationParams?: RotationParametersParams;
  createdAt?: Date;
  updatedAt?: Date;
};

type StellarBodyParams = CelestialBodyParams & {
  absoluteMagnitude: number;
  ageMY: number;
  luminosity: string;
  stellarMass: number;
  subclass: number;
  surfaceTemperature: number;
  starType: string;
};

type AsteroidBeltParams = {
  starId: number;
  systemAddress: number;
  ring: RingParams;
};

type BeltClusterParams = {
  beltId: number;
  clusterId: number;
  systemAddress: number;
};

type StatusFlagRecord = StatusFlag;

type CommodityParams = {
  commodity: string;
  statusFlags?: string[] | StatusFlagRecord[];
};

type MarketPriceParams = {
  marketId: number;
  commodity: CommodityParams;
  buyPrice: number;
  meanPrice: number;
  sellPrice: number;
  stock: number;
  stockBracket: number;
  demand: number;
  demandBracket: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type MarketSupplyParams = {
  marketId: number;
  commodity: CommodityParams;
  stock: number;
  stockBracket: number;
};

type MarketParams = {
  id: number;
  marketPrices: MarketPriceParams[];
  prohibitedItems?: string[];
};
