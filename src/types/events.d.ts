type EventLandingPads = {
  Large: number;
  Medium: number;
  Small: number;
};

type DockedLandingPads = EventLandingPads;

type DockedStationFaction = {
  Name: string;
  FactionState: string;
};

type DockedStationEconomy = {
  Name: string;
  Proportion: number;
};

type SystemCoordinatesParams = [number, number, number];

type DockedData = BasicSystemData & {
  DistFromStarLS: number;
  MarketID: number;
  StationEconomies: DockedStationEconomy[];
  StationEconomy: string;
  StationFaction: DockedStationFaction;
  StationGovernment: string;
  StationName: string;
  StationServices: string[];
  StationType: string;
  event: string;
  timestamp: string;
  /* OPTIONALS */
  /**
   * OPTIONAL IN DATA BUT
   * KIND OF SUPER IMPORTANT
   */
  LandingPads?: DockedLandingPads;
  /* ************************* */
  StationAllegiance?: string;
  Body?: string;
  BodyType?: string;
  StationState?: string;
  /**
   * DATA NOT RELEVANT TO
   * DATABASE ENTRIES
   */
  Multicrew?: boolean;
  Taxi?: boolean;
  horizons?: boolean;
  odyssey?: boolean;
};
type EDDNEvent = DockedData | FSDJumpData;

type TrendingStateJump = {
  State: string;
  Trend: number;
};

type ActiveStateJump = {
  State: string;
};

type SystemFactionJump = {
  Allegiance: string;
  FactionState: string;
  Government: string;
  Happiness: string;
  Influence: number;
  Name: string;
  RecoveringStates: TrendingState[];
  ActiveStates: ActiveState[];
  PendingStates: TrendingState[];
};

type PrimarySystemFactionJump = {
  Name: string;
  FactionState: string;
};

type ConflictFactionJump = {
  Name: string;
  Stake: string;
  WonDays: number;
};

type SystemConflictJump = {
  Faction1: ConflictFaction;
  Faction2: ConflictFaction;
  Status: string;
  WarType: string;
};

type ThargoidWarJump = {
  CurrentState: string;
  EstimatedRemainingTime: string;
  NextStateFailure: string;
  NextStateSuccess: string;
  RemainingPorts: number;
  SuccessStateReached: boolean;
  WarProgress: number;
};

type FSDJumpData = BasicSystemData & {
  Body: string;
  BodyID: number;
  BodyType: string;
  DistanceFromArrivalLS: number;
  Population: number;
  SystemAllegiance: string;
  SystemEconomy: string;
  SystemGovernment: string;
  SystemSecondEconomy: string;
  SystemSecurity: string;
  event: string;
  timestamp: string;
  Factions?: SystemFactionJump[];
  PowerplayState?: string;
  Powers?: string[];
  SystemFaction?: PrimarySystemFaction;
  Conflicts?: SystemConflict[];
  ThargoidWar: ThargoidWar;
};

type AtmosphereCompositionData = {
  Name: string;
  Percent: number;
};

type OrbitData = {
  SemiMajorAxis: number;
  Eccentricity: number;
  OrbitalInclination: number;
  OrbitalPeriod: number;
  Periapsis: number;
};

type BarycenterData = {
  AscendingNode: number;
  MeanAnomaly: number;
};

type BasicSystemData = {
  SystemAddress: number;
  StarSystem: string;
  StarPos: SystemCoordinatesParams;
};

type BasicBodyData = {
  BodyID: number;
  BodyName: string;
  DistanceFromArrivalLS: number;
};

type BaseScanData = BasicBodyData & BasicSystemData & { timestamp: string };

type RotationData = {
  AxialTilt: number;
  RotationPeriod: number;
  Radius: number;
};

type ParentPlanetData = {
  Planet: number;
};
type ParentStarData = {
  Star: number;
};
type ParentBarycenterData = {
  Null: number;
};

type ParentRingData = {
  Ring: number;
};

type ParentData =
  | ParentPlanetData
  | ParentStarData
  | ParentBarycenterData
  | ParentRingData;

type RingData = {
  Name: string;
  RingClass: string;
  MassMT: number;
  InnerRad: number;
  OuterRad: number;
};

type ParentBodyData = {
  Parents: ParentData[];
};

type RingedBodyData = {
  Rings: RingData[];
};

type StarData = {
  AbsoluteMagnitude: number;
  Age_MY: number;
  Luminosity: string;
  Subclass: number;
  SurfaceTemperature: number;
  StarType: string;
  StellarMass: number;
};

type StarScanData = StarData &
  BaseScanData &
  RotationData &
  Partial<
    ParentData & RingedBodyData & OrbitData & BarycenterData & ParentBodyData
  >;

type PlanetCompositionData = {
  Ice: number;
  Rock: number;
  Metal: number;
};

type MaterialData = {
  Name: string;
  Percent: number;
};
type AtmosphereData = {
  Atmosphere: string;
  AtmosphereType: string;
  AtmosphereComposition: AtmosphereCompositionData[];
};

type SurfaceMaterialData = {
  Materials: MaterialData[];
};

type PlanetData = {
  PlanetClass: string;
  ReserveLevel?: string;
  Composition?: PlanetCompositionData;
};

type PlanetSurfaceData = {
  MassEM: number;
  TidalLock: boolean;
  Landable: boolean;
  SurfaceGravity: number;
  SurfacePressure: number;
  SurfaceTemperature: number;
  Volcanism: string;
  TerraformState: string;
};

type PlanetScanData = PlanetData &
  PlanetSurfaceData &
  BaseScanData &
  OrbitData &
  RotationData &
  ParentBodyData &
  Partial<AtmosphereData> &
  Partial<AtmosphereCompositionData> &
  Partial<BarycenterData> &
  Partial<RingedBodyData> &
  Partial<PlanetCompositionData> &
  Partial<SurfaceMaterialData>;

type ScanData = BaseScanData & Partial<PlanetScanData & StarScanData>;

type SurfaceDetailsParams = {
  bodyId?: number;
  systemAddress?: number;
  massEM?: number;
  tidalLock?: boolean;
  landable?: boolean;
  surfaceGravity?: number;
  surfacePressure?: number;
  surfaceTemperature?: number;
  volcanism?: Volcanism;
  terraformState?: TerraformState;
};
