import React, { useEffect, useRef } from 'react';

import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
// import { CanvasRenderer } from 'echarts/renderers';


// echarts.use([SkiaRenderer, LineChart, GridComponent]);
echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  // CanvasRenderer,
  SkiaRenderer,
  LabelLayout
]);

export default function App() {
  const skiaRef = useRef(null);
  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '92%',
        left: 'center'
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          padAngle: 4,
          itemStyle: {
            borderRadius: 8
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 30,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 20, name: '人工' },
            { value: 30, name: '疑似ai' },
            { value: 40, name: 'ai' },
          ]
        }
      ]
    };
    let chart;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'skia',
        width:280,
        height:280,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, []);

  return <SkiaChart ref={skiaRef} />;
}