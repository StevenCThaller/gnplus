import AllegianceService from "@services/allegiance.service";
import ConflictStatusService from "@services/conflictStatus.service";
import EconomyService from "@services/economy.service";
import FactionStateService from "@services/factionState.service";
import GovernmentService from "@services/government.service";
import HappinessLevelService from "@services/happinessLevel.service";
import StatusFlagService from "@services/statusFlag.service";
import Container from "typedi";

export default async (): Promise<void> => {
  await Container.get(AllegianceService).seed();
  await Container.get(GovernmentService).seed();
  await Container.get(FactionStateService).seed();
  await Container.get(EconomyService).seed();
  await Container.get(HappinessLevelService).seed();
  await Container.get(ConflictStatusService).seed();
  await Container.get(StatusFlagService).seed();
};
