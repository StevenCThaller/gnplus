import EDDNService from "@stream/services/eddn";
import Container from "typedi";
// import Container from "typedi";

export default async (): Promise<void> => {
  const eddnService = Container.get(EDDNService);
  eddnService.Run();
};
