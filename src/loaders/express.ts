import express, { NextFunction, Request, RequestHandler, Response } from "express";
import cors from "cors";
import Container from "typedi";
import MarketService from "@services/market.service";
import LoggerInstance from "./logger";

export default async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get(
    "/markets/:marketId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        console.time("INTERNAL REQUESTHANDLE TIME");
        const srvc = Container.get(MarketService);
        let marketId: string | number = req.params.marketId;
        marketId = parseInt(marketId);
        const market = await srvc.getCurrentMarket(marketId as number);
        res.json(market);
        console.timeEnd("INTERNAL REQUESTHANDLE TIME");
      } catch (error) {
        console.log("Error :( ", error);
        res.sendStatus(500);
      }
    }
  );

  app.get("/markets", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const srvc = Container.get(MarketService);
      const marketPrices = await srvc.getCurrentCommodityPrices();
      res.json(marketPrices);
    } catch (error) {
      LoggerInstance.error("Error: %o", error);
      res.sendStatus(500);
    }
  });

  app.listen(3003, () => console.log("PENERS"));
  process.on("SIGINT", () => {
    console.log("Bye bye!");
    process.exit();
  });
};
