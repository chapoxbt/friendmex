import Link from "next/link";
import Image from "next/image";
import { Global, Currency } from "state/global";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  const { currency, setCurrency } = Global.useContainer();

  return (
    <div className="sticky top-0 z-50">

      {/* Main header */}
      <div className="flex justify-between h-14 px-4 items-center bg-bitmex-widget">
        <div>
          <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <span className="text-lg text-white font-mono font-semi">tribe.markets</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex border border-zinc-600 text-zinc-300">
            <button
              onClick={() => setCurrency(Currency.USD)}
              className={`px-1 hover:opacity-70 ${
                currency === Currency.USD ? "bg-zinc-500" : ""
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency(Currency.ETH)}
              className={`px-1 hover:opacity-70 ${
                currency === Currency.ETH ? "bg-zinc-500" : ""
              }`}
            >
              ETH
            </button>
          </div>

          <div className="md:flex hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
