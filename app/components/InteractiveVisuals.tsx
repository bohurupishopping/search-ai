import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ChartData {
  type: 'line' | 'bar' | 'scatter';
  title: string;
  x_label?: string;
  y_label?: string;
  elements: Array<{
    label: string;
    points: Array<[number, number]>;
    group?: string;
  }>;
}

interface StockData {
  title: string;
  data: any[];
  chart: {
    type: string;
    x_label: string;
    y_label: string;
    x_scale: string;
    elements: Array<{ label: string; points: Array<[number, number]> }>;
  };
}

interface InteractiveVisualsProps {
  data: ChartData | StockData;
  type: 'chart' | 'stock';
}

export const InteractiveVisuals = memo(({ data, type }: InteractiveVisualsProps) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#e5e5e5' : '#171717';
  const gridColor = theme === 'dark' ? '#404040' : '#e5e5e5';

  const sharedOptions = {
    backgroundColor: 'transparent',
    grid: { top: 50, right: 20, bottom: 40, left: 40 },
    legend: {
      textStyle: { color: textColor },
      top: 8
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderColor: gridColor,
      borderWidth: 1,
      textStyle: { color: textColor },
      trigger: 'axis',
      className: '!rounded-lg !border !border-neutral-200 dark:!border-neutral-800'
    },
  };

  const getChartOptions = () => {
    if (type === 'chart') {
      const chartData = data as ChartData;
      
      if (chartData.type === 'line' || chartData.type === 'scatter') {
        const series = chartData.elements.map((e) => ({
          name: e.label,
          type: chartData.type,
          data: e.points.map((p) => [p[0], p[1]]),
          smooth: true,
          symbolSize: chartData.type === 'scatter' ? 10 : 6
        }));

        return {
          ...sharedOptions,
          xAxis: {
            type: 'category',
            name: chartData.x_label,
            nameLocation: 'middle',
            nameGap: 25,
            axisLabel: { color: textColor },
            axisLine: { lineStyle: { color: gridColor } }
          },
          yAxis: {
            name: chartData.y_label,
            nameLocation: 'middle',
            nameGap: 30,
            axisLabel: { color: textColor },
            axisLine: { lineStyle: { color: gridColor } }
          },
          series
        };
      }

      if (chartData.type === 'bar') {
        const data = Object.groupBy(chartData.elements, ({ group }) => group);
        const series = Object.entries(data).map(([group, elements]) => ({
          name: group,
          type: 'bar',
          stack: 'total',
          data: elements?.map((e) => [e.label, e.points[0][1]]),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          }
        }));

        return {
          ...sharedOptions,
          xAxis: {
            type: 'category',
            name: chartData.x_label,
            nameLocation: 'middle',
            nameGap: 25,
            axisLabel: { color: textColor },
            axisLine: { lineStyle: { color: gridColor } }
          },
          yAxis: {
            name: chartData.y_label,
            nameLocation: 'middle',
            nameGap: 30,
            axisLabel: { color: textColor },
            axisLine: { lineStyle: { color: gridColor } }
          },
          series
        };
      }
    }

    // Stock chart options
    if (type === 'stock') {
      const stockData = data as StockData;
      const chartData = stockData.chart.elements[0].points;
      const values = chartData.map(p => p[1]);
      const dates = chartData.map(p => new Date(p[0]).toLocaleDateString());
      
      const priceChange = values[values.length - 1] - values[0];
      const color = priceChange >= 0 ? '#22c55e' : '#ef4444';

      return {
        ...sharedOptions,
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { show: true, lineStyle: { color: gridColor } },
          axisTick: { show: false },
          axisLabel: {
            color: textColor,
            fontSize: 11,
            hideOverlap: true
          }
        },
        yAxis: {
          type: 'value',
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            formatter: (value: number) => `$${value.toFixed(2)}`,
            color: textColor
          },
          splitLine: {
            show: true,
            lineStyle: { color: gridColor, type: 'dashed' }
          }
        },
        series: [{
          data: values,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: `${color}20` },
                { offset: 1, color: `${color}00` }
              ]
            }
          }
        }]
      };
    }

    return sharedOptions;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "overflow-hidden bg-white dark:bg-neutral-900",
        "rounded-xl border border-neutral-200 dark:border-neutral-800",
        "shadow-sm"
      )}
    >
      <div className="p-6">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
          {type === 'chart' ? (data as ChartData).title : (data as StockData).title}
        </h3>
        <ReactECharts 
          option={getChartOptions()} 
          style={{ height: '400px', width: '100%' }}
          theme={theme === 'dark' ? 'dark' : undefined}
        />
      </div>
    </motion.div>
  );
});

InteractiveVisuals.displayName = 'InteractiveVisuals';

export default InteractiveVisuals; 