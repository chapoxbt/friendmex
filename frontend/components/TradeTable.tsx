import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import React from "react";
import { parseUSD } from "utils/usd";
import { truncateAddress } from "utils";
import Address from "components/Address";
import type { ReactElement } from "react";
import { formatDistance } from "date-fns";
import type { Prisma } from "@prisma/client";
import { Global, Currency } from "state/global";
import type { TradeWithTwitterUser } from "pages/api/stats/trades";

// Render row background depending on trade type
function ColoredRow({
  isBuy,
  children,
}: {
  isBuy: boolean;
  children: ReactElement[];
}) {
  return isBuy ? (
    <TableRow className="bg-buy-30">{children}</TableRow>
  ) : (
    <TableRow className="bg-sell-30">{children}</TableRow>
  );
}

export default function TradeTable({
  trades,
}: {
  trades: TradeWithTwitterUser[];
}) {
  const { eth, currency } = Global.useContainer();

  /**
   * Calculate cost of trade based on selected currency
   * @param {Prisma.Decima} cost from DB
   * @returns {string} formatted
   */
  const calculateTradeCost = (cost: Prisma.Decimal): string => {
    // Calculate trade cost
    return currency === Currency.USD
      ? `$${parseUSD((Number(cost) / 1e18) * eth)}`
      : `${(Number(cost) / 1e18).toFixed(6)} ETH`;
  };

  return (
    <Table className="min-w-[950px] [&_td]:py-1 text-white">
      <TableHeader className="sticky top-0">
        <TableRow>
          <TableHead>Transaction Hash</TableHead>
          <TableHead>Time Since</TableHead>
          <TableHead>Block #</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Net</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade, i) => {
          const tradeCost: string = calculateTradeCost(trade.cost);

          return (
            <ColoredRow isBuy={trade.isBuy} key={i}>
              <TableCell>
                <a
                  href={`https://basescan.org/tx/${trade.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-mono text-sub-alt hover:text-white"
                >
                  {truncateAddress(trade.hash, 6)}
                </a>
              </TableCell>
              <TableCell suppressHydrationWarning={true} className="font-mono text-sub-alt">
                {formatDistance(new Date(trade.timestamp * 1000), new Date(), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <a
                  href={`https://basescan.org/block/${trade.blockNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sub-alt font-mono hover:text-white"
                >
                  {trade.blockNumber}
                </a>
              </TableCell>
              <TableCell className="font-mono">
                <Address
                  address={trade.fromAddress}
                  username={trade.fromUser.twitterUsername}
                  image={trade.fromUser.twitterPfpUrl}
                />
              </TableCell>
              <TableCell className="font-mono">
                <Address
                  address={trade.subjectAddress}
                  username={trade.subjectUser.twitterUsername}
                  image={trade.subjectUser.twitterPfpUrl}
                />
              </TableCell>
              <TableCell>
                <span className="font-mono">
                  {trade.isBuy ? "+" : "-"}
                  {trade.amount}
                </span>
              </TableCell>
              <TableCell>
                {trade.isBuy ? (
                  <span className="text-buy font-mono">{tradeCost}</span>
                ) : (
                  <span className="text-sell font-mono">{tradeCost}</span>
                )}
              </TableCell>
            </ColoredRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
