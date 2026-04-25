import React, { useState } from 'react';
import StockChart from './StockChart';
import AIReport from './AIReport';

// MainBoard 컴포넌트가 부모로부터 받을 데이터(Props)의 타입을 정의
interface MainBoardProps {
  stockName: string;   // 종목명 (예: "삼성전자", "Apple Inc.")
  changeRate: string;  // 등락률 (예: "-5.29%", "+1.2%")
}

// 부모가 전달해준 props를 괄호 안에서 구조 분해 할당으로 꺼내옵니다.
export default function MainBoard({ stockName, changeRate }: MainBoardProps) {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const targetStock = "005930"; // 임시 타겟 주식 코드

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    try {
      // API 연결 전, 1.5초 대기 후 Mock Data 반환
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const MOCK_REPORT_DATA = {
        recommendation: "매수", // 매수, 매도, 관망 등
        factors: [
          { id: 1, label: "기술적 분석", score: -3 },
          { id: 2, label: "기본적 분석", score: 8 },
          { id: 3, label: "거시 경제", score: -1 },
          { id: 4, label: "시장 심리", score: 6 }
        ]
      };
      
      setAnalysisData(MOCK_REPORT_DATA);
    } catch (error) {
      console.error("AI 리포트 생성 실패:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="main-board">
      {/* 좌측: 주식 차트 영역 */}
      <section className="board-section">
        <div className="section-header">
          {/*stockName 변수를 출력*/}
          <div className="title-pill">{stockName}</div>
          
          {/*등락율 출력*/}
          <div className="title-pill percent">{changeRate}</div>
        </div>
        
        <div className="content-area" style={{ padding: 0, overflow: 'hidden' }}>
          <StockChart />
        </div>
      </section>

      {/* 우측: AI 리포트 영역 */}
      <section className="board-section">
        <div className="section-header">
          <div className="title-pill">AI Report</div>
        </div>
        
        <div className="content-area" style={{ flexDirection: 'column', padding: '20px' }}>
          {analysisData ? (
            <AIReport data={analysisData} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#8b95a1', marginBottom: '16px', fontSize: '1rem' }}>
                전문적인 AI 분석 리포트가 필요하신가요?
              </p>
              <button 
                onClick={handleGenerateReport}
                disabled={isAnalyzing}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isAnalyzing ? '#a8b0ba' : '#3182f6',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s',
                }}
              >
                {isAnalyzing ? "AI 분석 중..." : "AI 분석 리포트 생성하기"}
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}