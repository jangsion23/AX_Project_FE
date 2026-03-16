import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

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
      width: container.clientWidth,
    });
    const candlestickSeries = chart.addSeries(CandlestickSeries, SERIES_CONFIG);
    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width});
    });
    resizeObserver.observe(container);

    // TEST
    let lastClose = 100;
    let lastDate = new Date('2026-03-05');

    const testInterval = setInterval(() => {
      lastDate.setDate(lastDate.getDate() + 1);
      const nextTime = lastDate.toISOString().split('T')[0];

      const open = lastClose + (Math.random() * 4 - 2); 
      const close = open + (Math.random() * 10 - 5);
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;
      // 캔들스틱 데이터   { time: '2026-03-01', open: 100, high: 110, low: 90, close: 105 },

      const newData = { time: nextTime, open, high, low, close };
      candlestickSeries.update(newData as any);
      lastClose = close;
    }, 1000); // 1초마다 실행

    // 백엔드 접목 이후
    /*
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // .env 파일에 설정
    const socket = new WebSocket(`${SOCKET_URL}/ws/stock`);

    socket.onopen = () => {
      console.log('웹소켓 서버와 연결되었습니다.');
    };
    socket.onmessage = (event) => {
      const liveData = JSON.parse(event.data);
      candlestickSeries.update(liveData);
    };

    // 에러 핸들링
    socket.onerror = (error) => {
      console.error('웹소켓 에러 발생:', error);
    };
    */

    return () => {
      resizeObserver.disconnect()
      clearInterval(testInterval); 
      // socket.close();           
      chart.remove();             
    };
  }, []);

  return <div ref={chartContainerRef} style={{ width: '100%'}}/>;
};

export default StockChart;

/* 
웹 소켓을 이용해서 받아와야함. 기존의 REST 방식으로는 불가능함
또는 SSE 방식을 택해야하는데 이부분도 공부를 해보면 좋을 것 같음.
한번 이부분은 조금 더 이야기를 나눠봐야할 것 같고 추가적인 공부가 필요한 부분
 */