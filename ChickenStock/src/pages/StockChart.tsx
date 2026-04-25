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

   // 웹소켓 클라이언트 변수를 상단에 선언하여 클린업 함수에서 접근할 수 있도록 함
    let client: Client | null = null;

    // 1. 초기 데이터 로드 (REST API)
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/stock/${targetStock}`);
        if (response.ok) {
          const data = await response.json();
          
          // 백엔드 데이터(단건)를 lightweight-charts 형식으로 변환
          const initialCandle = {
            time: data.time,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
          };
          
          // setData는 초기 렌더링용이며 배열 형태를 받습니다.
          // 백엔드에서 배열로 과거 데이터를 준다면 map을 돌려 통째로 넣고, 
          // 현재가 단건만 준다면 이렇게 배열로 감싸서 넣어줍니다.
          candlestickSeries.setData([initialCandle] as any);
        }
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
      } finally {
        // 2. 초기 세팅이 끝나면(성공/실패 무관) STOMP 웹소켓 연결 시작
        connectWebSocket();
      }
    };

    // 3. 웹소켓 연결 로직 (함수로 분리)
    const connectWebSocket = () => {
      client = new Client({
        brokerURL: 'ws://localhost:8080/ws-stock', // 실제 배포 환경에 맞춰 도메인 변경 필요
        onConnect: () => {
          console.log('STOMP 연결 성공');
          client?.subscribe(`/topic/stock/${targetStock}`, (message) => {
            const data = JSON.parse(message.body);
            const candle = {
              time: data.time,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
            };
            // update는 새로운 데이터를 추가하거나 마지막 캔들을 갱신할 때 사용합니다.
            candlestickSeries.update(candle as any);
          });
        },
        onDisconnect: () => console.log('STOMP 연결 종료'),
        onStompError: (frame) => console.error('STOMP 에러:', frame),
      });
      client.activate();
    };

    // 로직 실행 (fetch -> 완료 시 connectWebSocket 실행)
    fetchInitialData();

    return () => {
      resizeObserver.disconnect();
      if (client)client.deactivate();
      chart.remove();
    };
  }, []);

  return <div ref={chartContainerRef} style={{ width: '100%', minHeight: '400px' }} />;
};

export default StockChart;