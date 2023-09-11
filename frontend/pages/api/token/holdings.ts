import db from "prisma/index";
import cache from "utils/cache";
import type { Trade, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

type Holding = User & { balance: number };
type ExtendedTrade = Trade & { subjectUser: User };
type CachedHoldings = { lastChecked: Date; holdings: Holding[] };

function processHoldings(
  trades: ExtendedTrade[],
  existing?: Holding[]
  
): Holding[] {
  // Setup balances and users
  let subjectToBalance: Record<string, number> = {};
  let subjectToUser: Record<string, User> = {};
  

  // If existing cached holdings
  if (existing) {
    // Update local states
    for (const holding of existing) {
      subjectToBalance[holding.address] = holding.balance;
      const { balance, ...rest } = holding;
      subjectToUser[holding.address] = rest;
    }
  }

  // For each trade
  for (const trade of trades) {
    // Initialize:
    if (!subjectToBalance[trade.subjectAddress]) {
      // Initialize balance
      subjectToBalance[trade.subjectAddress] = 0;
      // Initialize data
      subjectToUser[trade.subjectAddress] = trade.subjectUser;
    }

    // Process trade
    if (trade.isBuy) {
      subjectToBalance[trade.subjectAddress] += trade.amount;
    } else {
      subjectToBalance[trade.subjectAddress] -= trade.amount;
    }
  }

  // Recompile to return format
  let holdings: (User & { balance: number })[] = [];
  for (const address of Object.keys(subjectToBalance)) {
    if (subjectToBalance[address] > 0) {
      holdings.push({
        ...subjectToUser[address],
        balance: subjectToBalance[address],
      });
    }
  }

  // Sort by most owned first
  holdings = holdings.sort((a, b) => b.balance - a.balance);

  return holdings;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Entered function");
  
  let { address } = req.query;
  if (!address) return res.status(400).json({ error: "Missing token address" });
  
  if (Array.isArray(address)) address = address[0];
  address = address.toLowerCase();

  let data: CachedHoldings;
  try {
    const cachedString = await cache.get(`holdings_${address}`);
    console.log("Cached string:", cachedString);

    if (cachedString) {
      const parseString = JSON.parse(cachedString);
      const parsed: CachedHoldings = {
        ...parseString,
        lastChecked: new Date(parseString.lastChecked),
      };

      const trades: ExtendedTrade[] = await db.trade.findMany({
        where: {
          fromAddress: address,
          createdAt: {
            gte: parsed.lastChecked,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
        include: {
          subjectUser: true,
        },
      });
      console.log("New trades:", trades);

      if (trades.length === 0) {
        const ok = await cache.set(
          `holdings_${address}`,
          JSON.stringify({
            ...parsed,
            lastChecked: new Date(),
          })
        );
        if (!ok) throw new Error("Could not save to Redis");
        return res.status(200).send(parsed.holdings);
      }

      data = {
        lastChecked: new Date(),
        holdings: processHoldings(trades, parsed.holdings),
      };
    } else {
      const trades: ExtendedTrade[] = await db.trade.findMany({
        where: {
          fromAddress: address,
        },
        orderBy: {
          timestamp: "asc",
        },
        include: {
          subjectUser: true,
        },
      });
      console.log("All trades:", trades);

      data = {
        lastChecked: new Date(),
        holdings: processHoldings(trades),
      };
    }

    const ok = await cache.set(`holdings_${address}`, JSON.stringify(data));
    if (!ok) throw new Error("Could not save to Redis");

    return res.status(200).json(data.holdings);
  } catch (e: unknown) {
    console.error("Error:", e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
