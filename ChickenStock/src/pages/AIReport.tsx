import React from 'react';

interface AIReportProps {
  data: {
    recommendation: string;
    factors: {
      id: number;
      label: string;
      score: number; // -10 ~ 10
    }[];
  };
}

const CircularProgress = ({ score }: { score: number }) => {
  const isPositive = score > 0;
  const isZero = score === 0;
  
  // Toss Colors
  const mainColor = isPositive ? '#f04452' : isZero ? '#8b95a1' : '#3182f6';
  const bgColor = isPositive ? '#fee9eb' : isZero ? '#f2f4f6' : '#e8f3ff';
  
  // 백분율 계산 (0 ~ 1)
  const percentage = Math.min(Math.abs(score) / 10, 1);
  
  // 그래프 사이즈 키움
  const size = 90;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, marginBottom: '16px' }}>
      <svg width={`${size}px`} height={`${size}px`} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* 배경 원형 궤도 */}
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          fill="transparent" 
          stroke={bgColor} 
          strokeWidth={strokeWidth} 
        />
        {/* 차오르는 진행 바 */}
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          fill="transparent" 
          stroke={mainColor} 
          strokeWidth={strokeWidth} 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* 텍스트 (정중앙 배치) */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: mainColor }}>
          {score > 0 ? `+${score}` : score}
        </span>
      </div>
    </div>
  );
};

export default function AIReport({ data }: AIReportProps) {
  // 종합 의견 배지 색상
  const getRecStyles = () => {
    if (data.recommendation.includes('매수')) {
      return { 
        gradient: 'linear-gradient(135deg, #fff3f4 0%, #ffe1e4 100%)', 
        color: '#f04452',
        shadow: '0 12px 24px rgba(240, 68, 82, 0.2)'
      };
    } else if (data.recommendation.includes('매도')) {
      return { 
        gradient: 'linear-gradient(135deg, #f0f7ff 0%, #d8ebff 100%)', 
        color: '#3182f6',
        shadow: '0 12px 24px rgba(49, 130, 246, 0.2)'
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #f9fafb 0%, #f2f4f6 100%)', 
      color: '#4e5968',
      shadow: '0 12px 24px rgba(78, 89, 104, 0.1)'
    };
  };

  const recStyle = getRecStyles();

  return (
    <div style={{ width: '100%', height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 최고 상단 메인 추천 배지 */}
      <div style={{ 
        background: recStyle.gradient,
        borderRadius: '24px', 
        padding: '24px 60px',
        marginBottom: '40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: recStyle.shadow,
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: recStyle.color, opacity: 0.8, marginBottom: '4px', letterSpacing: '-0.3px' }}>
          AI 종합 분석 의견
        </div>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: recStyle.color, margin: 0, letterSpacing: '-1px' }}>
          {data.recommendation || '분석중'}
        </h2>
      </div>

      {/* 하단 4가지 분석 지표 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '16px', 
        width: '100%' 
      }}>
        {data.factors?.map((factor) => {
          const isPositive = factor.score > 0;
          const isZero = factor.score === 0;
          const labelColor = isPositive ? '#f04452' : isZero ? '#8b95a1' : '#3182f6';
          const labelText = isPositive ? '긍정적' : isZero ? '중립적' : '부정적';

          return (
            <div key={factor.id} style={{ 
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(0,0,0,0.02)',
            }}>
              {/* 위 타이틀 */}
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#8b95a1', marginBottom: '16px', textAlign: 'center', wordBreak: 'keep-all' }}>
                {factor.label}
              </div>

              {/* 점수 기반 원형 그래프 */}
              <CircularProgress score={factor.score} />

              {/* 하단 상태 텍스트 */}
              <div style={{ fontSize: '1rem', fontWeight: 700, color: labelColor }}>
                {labelText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
