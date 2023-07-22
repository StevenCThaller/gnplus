import { Inject, Service } from "typedi";
import QueryService from "./query.service";
import { EntityManager, Repository } from "typeorm";
import {
  Market,
  Commodity,
  StatusFlag,
  MarketPrice,
  GalacticAverage,
  Station,
  ProhibitedItem
} from "@models/index";
import { Logger } from "winston";
import CurrentMarketPrice from "@models/currentMarketPrice.model";

@Service()
export default class MarketService {
  private queryService: QueryService;
  // private marketRepository: Repository<Market>;
  // private commodityRepository: Repository<Commodity>;
  // private statusFlagRepository: Repository<StatusFlag>;
  // private marketPriceRepository: Repository<MarketPrice>;
  // private galacticAverageRepository: Repository<GalacticAverage>;
  // private currentMarketPriceRepository: Repository<CurrentMarketPrice>;
  private logger: Logger;

  constructor(@Inject() queryService: QueryService, @Inject("logger") logger: Logger) {
    this.queryService = queryService;
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getCurrentCommodityPrices(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.queryService.transaction(async (): Promise<any> => {
      const query = this.queryService
        .getEntityManager()
        .createQueryBuilder()
        .select("current_market_prices.commodity_id")
        .addSelect("commodities.commodity", "commodity")
        .addSelect("AVG(market_prices.buy_price)", "buyPrice")
        .addSelect("AVG(market_prices.supply)", "supply")
        .addSelect("AVG(market_prices.sell_price)", "sellPrice")
        .addSelect("AVG(market_prices.demand)", "demand")
        .addSelect("galactic_averages.mean_price", "galactic_avg")
        .addSelect("MAX(market_prices.created_at)", "timestamp")
        .from(CurrentMarketPrice, "current_market_prices")
        .innerJoin(
          MarketPrice,
          "market_prices",
          "current_market_prices.market_price_id = market_prices.id"
        )
        .innerJoin(Commodity, "commodities", "commodities.id = current_market_prices.commodity_id")
        .innerJoin(
          GalacticAverage,
          "galactic_averages",
          "current_market_prices.commodity_id = galactic_averages.commodity_id"
        )
        .groupBy("current_market_prices.commodity_id");
      const results = await query.getRawMany();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return results.map((result: any): any => {
        result.buyPrice = Math.round(Number(result.buyPrice));
        result.sellPrice = Math.round(Number(result.sellPrice));
        result.supply = Math.round(Number(result.supply));
        result.demand = Math.round(Number(result.demand));
        const profit = result.sellPrice - result.buyPrice;
        result.profit = Math.round(profit > 0 ? Math.round(profit) : 0);

        return result;
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getCurrentMarket(marketId: number): Promise<any> {
    return this.queryService.transaction(async () => {
      console.time("getCurrentMarket");
      const query = this.queryService
        .getEntityManager()
        .createQueryBuilder()
        .select("market_prices.market_id", "marketId")
        .addSelect("market_prices.commodity_id", "commodityId")
        .addSelect("market_prices.buy_price", "buyPrice")
        .addSelect("market_prices.supply", "supply")
        .addSelect("market_prices.supply_bracket", "supplyBracket")
        .addSelect("market_prices.sell_price", "sellPrice")
        .addSelect("market_prices.demand", "demand")
        .addSelect("market_prices.demand_bracket", "demandBracket")
        .addSelect("market_prices.created_at", "timestamp")
        .addSelect("commodities.commodity", "name")
        .addSelect("galactic_averages.mean_price", "galactic_average")
        .addSelect("stations.station_name", "station_name")
        .from(CurrentMarketPrice, "current_market_prices")
        .leftJoin(
          MarketPrice,
          "market_prices",
          "current_market_prices.market_price_id = market_prices.id"
        )
        .leftJoin(Commodity, "commodities", "commodities.id = market_prices.commodity_id")
        .leftJoin(
          GalacticAverage,
          "galactic_averages",
          "commodities.id = galactic_averages.commodity_id"
        )
        .leftJoin(Station, "stations", "stations.id = current_market_prices.market_id")
        .where("market_prices.market_id = :marketId", { marketId });

      const results = await query.getRawMany();
      console.timeEnd("getCurrentMarket");
      return results;
      //this.formatCurrentMarketResults(results);
    });
  }

  public async updateOrCreateMarket(marketData: CommodityEventData): Promise<void> {
    return this.queryService.transaction(async () => {
      const repo: Repository<Market> = this.queryService.getRepository(Market);

      let market: Market | null = await repo.findOne({
        where: { id: marketData.marketId }
      });

      if (!market) {
        market = new Market(marketData.marketId, new Date(marketData.timestamp));
        // this.logger.info("New market %s", marketData.marketId);
      } else {
        market.updatedAt = new Date(marketData.timestamp);
      }

      await this.upsertProhibitedItems(market, marketData.prohibited);

      await repo.save(market);

      await this.bulkCreateMarketPrices(marketData.marketId, marketData.commodities);
    });
  }

  private async upsertProhibitedItems(market: Market, prohibitedItems?: string[]): Promise<void> {
    if (!prohibitedItems || prohibitedItems.length === 0) {
      market.prohibitedItems = [];
      return;
    }

    const prohibiteItemRecords: ProhibitedItem[] = await Promise.all(
      prohibitedItems.map(
        async (itemName: string): Promise<ProhibitedItem> =>
          await this.queryService.findOrCreateEntity(ProhibitedItem, { itemName })
      )
    );

    market.prohibitedItems = prohibiteItemRecords;
  }

  private async bulkCreateMarketPrices(
    marketId: number,
    marketPriceDataArr: CommodityData[]
  ): Promise<MarketPrice[]> {
    const marketPrices: MarketPrice[] = [];

    for (const marketPriceData of marketPriceDataArr) {
      const marketPriceRecord: MarketPrice = await this.createMarketPrice(
        marketId,
        marketPriceData
      );
      marketPrices.push(marketPriceRecord);
    }
    return marketPrices;
  }

  private async updateCurrentMarketPrice(
    marketId: number,
    commodityId: number,
    marketPriceId: number
  ): Promise<CurrentMarketPrice> {
    const repo = this.queryService.getRepository(CurrentMarketPrice);
    try {
      let currentMarketPriceRecord = await repo.findOne({
        where: { marketId, commodityId }
      });

      if (!currentMarketPriceRecord) {
        currentMarketPriceRecord = new CurrentMarketPrice();
        currentMarketPriceRecord.commodityId = commodityId;
        currentMarketPriceRecord.marketId = marketId;
        currentMarketPriceRecord.marketPriceId = marketPriceId;
      } else {
        currentMarketPriceRecord.marketPriceId = marketPriceId;
      }
      await repo.save(currentMarketPriceRecord);
      return currentMarketPriceRecord;
    } catch (error) {
      this.logger.info("Error thrown running MarketService.updateGalacticAvg: %o", error);
      throw error;
    }
  }

  private async updateGalacticAvg(
    commodityId: number,
    meanPrice: number
  ): Promise<GalacticAverage> {
    const repo: Repository<GalacticAverage> = this.queryService.getRepository(GalacticAverage);
    try {
      let galacticAvgRecord = await repo.findOne({
        where: { commodityId }
      });

      if (!galacticAvgRecord) {
        galacticAvgRecord = new GalacticAverage();
        galacticAvgRecord.commodityId = commodityId;
        galacticAvgRecord.meanPrice = meanPrice;
      } else {
        galacticAvgRecord.meanPrice = meanPrice;
      }

      await repo.save(galacticAvgRecord);
      return galacticAvgRecord;
    } catch (error) {
      this.logger.info("Error thrown running MarketService.updateGalacticAvg: %o", error);
      throw error;
    }
  }

  private async createMarketPrice(
    marketId: number,
    marketPriceData: CommodityData
  ): Promise<MarketPrice> {
    const repo: Repository<MarketPrice> = this.queryService.getRepository(MarketPrice);

    const commodityName = marketPriceData.name;
    const statusFlags: string[] | undefined = marketPriceData.statusFlags;

    const commodity = await this.findOrCreateCommodity(commodityName, statusFlags);
    const commodityId = commodity.id;

    const marketPrice = new MarketPrice();
    marketPrice.marketId = marketId;
    marketPrice.commodityId = commodityId;
    marketPrice.buyPrice = marketPriceData.buyPrice;
    marketPrice.supply = marketPriceData.stock;
    marketPrice.supplyBracket = marketPriceData.stockBracket || 0;
    marketPrice.sellPrice = marketPriceData.sellPrice;
    marketPrice.demand = marketPriceData.demand;
    marketPrice.demandBracket = marketPriceData.demandBracket || 0;
    marketPrice.meanPrice = marketPriceData.meanPrice;

    await repo.save(marketPrice);

    await this.updateGalacticAvg(commodityId, marketPriceData.meanPrice);
    await this.updateCurrentMarketPrice(marketId, commodityId, marketPrice.id);

    return marketPrice;
  }

  private async findOrCreateCommodity(
    commodity: string,
    statusFlags?: string[]
  ): Promise<Commodity> {
    const repo: Repository<Commodity> = this.queryService.getRepository(Commodity);
    let commodityRecord: Commodity | null = await repo.findOne({
      where: { commodity }
    });

    if (!commodityRecord) {
      commodityRecord = new Commodity(commodity);

      commodityRecord.statusFlags = statusFlags
        ? await Promise.all(
            statusFlags.map(
              (flag: string): Promise<StatusFlag> => this.findOrCreateStatusFlag(flag)
            )
          )
        : [];

      this.logger.info("Saving new commodity: %s", commodity);

      await repo.save(commodityRecord);
    }

    return commodityRecord;
  }

  private async findOrCreateStatusFlag(flag: string): Promise<StatusFlag> {
    const repo: Repository<StatusFlag> = this.queryService.getRepository(StatusFlag);
    let statusFlagRecord: StatusFlag | null = await repo.findOne({
      where: { flag }
    });

    if (!statusFlagRecord) {
      statusFlagRecord = repo.create({ flag });
      this.logger.info("Saving new status flag: %s", flag);
      await repo.save(statusFlagRecord);
    }

    return statusFlagRecord;
  }

  private formatCurrentMarketResults(results: any): any {
    if (!results.length) return { commodities: [], lastUpdated: "" };
    const market = {
      commodities: {},
      lastUpdated: results[0].last_updated
    };

    results.forEach((result: any) => {
      const {
        commodity_id,
        name,
        buy_price,
        supply,
        supply_bracket,
        sell_price,
        demand,
        demand_bracket,
        galactic_avg,
        created_at
      } = result;

      const historicPrice: any = {
        commodityId: commodity_id,
        buyPrice: buy_price,
        supply,
        supplyBracket: supply_bracket,
        sellPrice: sell_price,
        demand,
        demandBracket: demand_bracket,
        meanPrice: galactic_avg,
        createdAt: created_at
      };

      if (!(market.commodities as any)[name]) {
        (market.commodities as any)[name] = {
          commodityId: commodity_id,
          buyPrice: buy_price,
          supply,
          supplyBracket: supply_bracket,
          sellPrice: sell_price,
          demand,
          demandBracket: demand_bracket,
          galacticAvg: galactic_avg,
          historicPrices: [historicPrice],
          last_update: created_at
        };
      } else {
        (market.commodities as any)[name].historicPrices.push(historicPrice);
      }
    });

    market.commodities = Object.keys(market.commodities).map((name: string): any => ({
      commodity: name,
      ...(market.commodities as any)[name]
    }));

    return market;
  }
}
