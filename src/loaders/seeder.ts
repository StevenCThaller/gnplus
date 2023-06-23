import SeedService from "@services/seed.service";
import Container from "typedi";

export default async (): Promise<void> => {
  await Container.get(SeedService).seedDatabase();
};
