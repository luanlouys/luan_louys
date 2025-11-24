
import React from 'react';
import { Transaction } from '../types';

interface AnalyticsChartProps {
  transactions: Transaction[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ transactions }) => {
  // Sort by time
  const sortedTx = [...transactions]
    .filter(t => t.status === 'COMPLETED')
    .sort((a, b) => a.timestamp - b.timestamp);

  if (sortedTx.length < 2) return null;

  // Calculate cumulative balance over time
  let runningBalance = 0;
  const dataPoints = sortedTx.map(t => {
    if (t.type === 'EARN') runningBalance += t.amount;
    else runningBalance -= t.amount;
    return { date: t.timestamp, value: runningBalance };
  });

  // Include a start point (0)
  if (dataPoints.length > 0) {
      dataPoints.unshift({ date: dataPoints[0].date - 1000, value: 0 });
  }

  // Determine SVG coordinates
  const width = 100;
  const height = 50;
  const padding = 5;

  const minVal = Math.min(...dataPoints.map(d => d.value), 0);
  const maxVal = Math.max(...dataPoints.map(d => d.value), 10);
  const rangeY = maxVal - minVal || 1;
  
  const minTime = dataPoints[0].date;
  const maxTime = dataPoints[dataPoints.length - 1].date;
  const rangeX = maxTime - minTime || 1;

  const points = dataPoints.map(d => {
    const x = padding + ((d.date - minTime) / rangeX) * (width - 2 * padding);
    const y = height - (padding + ((d.value - minVal) / rangeY) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mt-4">
      <h4 className="font-bold text-slate-700 mb-2 text-sm">Evolução do Saldo</h4>
      <div className="w-full aspect-[2/1] relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#f1f5f9" strokeWidth="0.5" />

          {/* Line */}
          <polyline 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="2" 
            points={points} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Dots */}
          {dataPoints.map((d, i) => {
             const x = padding + ((d.date - minTime) / rangeX) * (width - 2 * padding);
             const y = height - (padding + ((d.value - minVal) / rangeY) * (height - 2 * padding));
             // Only show dot for last point or significant points
             if (i === dataPoints.length - 1) {
                return <circle key={i} cx={x} cy={y} r="2" fill="#0ea5e9" stroke="white" strokeWidth="1" />
             }
             return null;
          })}
        </svg>
      </div>
    </div>
  );
};

export default AnalyticsChart;
