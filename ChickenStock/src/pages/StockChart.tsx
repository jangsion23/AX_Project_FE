import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { Client } from '@stomp/stompjs';

const CHART_CONFIG = {
  height: 400,
  layout: {
    background: { type: ColorType.Solid, color: '#ffffff' },
    textColor: '#333',
  },
  grid: {
    vertLines: { color: '#f0f3fa' },
    horzLines: { color: '#f0f3fa' },
  },
} as const;

const SERIES_CONFIG = {
  upColor: '#ef5350',
  downColor: '#26a69a',
  borderVisible: false,
  wickUpColor: '#ef5350',
  wickDownColor: '#26a69a',
} as const;

const StockChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    const chart = createChart(container, {
      ...CHART_CONFIG,
      width: container.clientWidth || 600,
    });
    const candlestickSeries = chart.addSeries(CandlestickSeries, SERIES_CONFIG);
    candlestickSeries.setData([]);

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(container);

    // STOMP 연결
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-stock',
      onConnect: () => {
        console.log('STOMP 연결 성공');
        client.subscribe('/topic/stock/005930', (message) => {
          const data = JSON.parse(message.body);
          // 백엔드에서 오는 time을 lightweight-charts 형식으로 변환
          const candle = {
            time: data.time,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
          };
          candlestickSeries.update(candle as any);
        });
      },
      onDisconnect: () => console.log('STOMP 연결 종료'),
      onStompError: (frame) => console.error('STOMP 에러:', frame),
    });
    client.activate();

    return () => {
      resizeObserver.disconnect();
      client.deactivate();
      chart.remove();
    };
  }, []);

  return <div ref={chartContainerRef} style={{ width: '100%', minHeight: '400px' }} />;
};

export default StockChart;