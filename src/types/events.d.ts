type EventLandingPads = {
  Large: number;
  Medium: number;
  Small: number;
};

type DockedLandingPads = EventLandingPads;

type StarPosData = [number, number, number];

type DockedStationFaction = {
  Name: string;
  FactionState: string;
};

type DockedStationEconomy = {
  Name: string;
  Proportion: number;
};

type DockedData = {
  DistFromStarLS: number;
  MarketID: number;
  StarPos: StarPosData;
  StarSystem: string;
  StationEconomies: DockedStationEconomy[];
  StationEconomy: string;
  StationFaction: DockedStationFaction;
  StationGovernment: string;
  StationName: string;
  StationServices: string[];
  StationType: string;
  SystemAddress: number;
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

type FSDJumpData = {
  Body: string;
  BodyID: string;
  BodyType: string;
  Population: number;
  StarPos: DockedStarPos;
  StarSystem: string;
  SystemAddress: number;
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
