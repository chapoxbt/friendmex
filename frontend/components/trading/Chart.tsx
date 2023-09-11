import { useEffect, useRef } from 'react';
import Card from 'components/Card';
import { truncateAddress } from 'utils';
import { renderTimeSince } from 'utils/time';
import { usePollData } from 'utils/usePollData';
import { Global, StateUser } from 'state/global';
import { createChart } from 'lightweight-charts';

function aggregateTo4HTicks(data) {
  const aggregatedData = [];
  let currentInterval = null;
  let open = null;
  let high = null;
  let low = null;
  let close = null;

  data.forEach((item) => {
    const date = new Date(item.timestamp);
    const interval = new Date(date);
    interval.setMinutes(0, 0, 0);
    interval.setHours(Math.floor(interval.getHours() / 4) * 4);  // Round down to the nearest 4-hour interval

    if (currentInterval === null) {
      currentInterval = interval;
      open = item['Price (ETH)'];
      high = item['Price (ETH)'];
      low = item['Price (ETH)'];
    }

    if (interval.getTime() === currentInterval.getTime()) {
      high = Math.max(high, item['Price (ETH)']);
      low = Math.min(low, item['Price (ETH)']);
      close = item['Price (ETH)'];
    } else {
      aggregatedData.push([currentInterval.getTime(), open, high, low, close]);
      currentInterval = interval;
      open = item['Price (ETH)'];
      high = item['Price (ETH)'];
      low = item['Price (ETH)'];
      close = item['Price (ETH)'];
    }
  });

  if (currentInterval !== null) {
    aggregatedData.push([currentInterval.getTime(), open, high, low, close]);
  }

  return aggregatedData;
}

export default function Chart() {
  const chartContainerRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const { user }: { user: StateUser } = Global.useContainer();
  const { data, lastChecked } = usePollData<
    { timestamp: string; 'Price (ETH)': number }[]
  >(`/api/token/chart?address=${user.address}`, [], 15 * 1000);

  const aggregatedData = aggregateTo4HTicks(data);

  useEffect(() => {
    if (chartContainerRef.current && !candlestickSeriesRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: '#000000',
          textColor: '#ffffff'
        },
        grid: {
          vertLines: {
            color: '#333333',
            style: 1,
            visible: true,
          },
          horzLines: {
            color: '#333333',
            style: 1,
            visible: true,
          },
        },
      });

      candlestickSeriesRef.current = chart.addCandlestickSeries();
    }

    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(
        aggregatedData.map(([time, open, high, low, close]) => ({
          time: time / 1000,
          open,
          high,
          low,
          close,
        }))
      );
    }
  }, [aggregatedData]);

  return (
    <Card 
      title="Chart"
      updated={`${
        user.username ? `@${user.username}` : truncateAddress(user.address, 6)
      }, ${renderTimeSince(lastChecked)} ago`}
    >
      <div ref={chartContainerRef} className="w-full h-full"></div>
    </Card>
  );
}
