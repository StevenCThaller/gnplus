type EventLandingPads = {
  Large: number;
  Medium: number;
  Small: number;
};

type DockedLandingPads = EventLandingPads;

type DockedStarPos = [number, number, number];

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
  StarPos: DockedStarPos;
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

type EDDNEvent = DockedData;
