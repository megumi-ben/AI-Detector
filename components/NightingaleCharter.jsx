import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { PieChart } from 'echarts/charts';
import { LegendComponent, ToolboxComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout } from 'echarts/features';
// import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  ToolboxComponent,
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
      // legend: {
      //   // top: 'bottom'
      // },
      toolbox: {
        show: false,
        feature: {
          mark: { show: false },
          dataView: { show: false, readOnly: false },
          restore: { show: false },
          saveAsImage: { show: false }
        }
      },
      series: [
        {
          name: 'Nightingale Chart',
          type: 'pie',
          radius: [25, 110],
          center: ['52%', '50%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 4,
          },
          data: [
            { value: 40, name: 'Kimi' },
            { value: 38, name: '豆包' },
            { value: 32, name: '混元' },
            { value: 30, name: '星火' },
            { value: 28, name: '文心一言' },
            { value: 26, name: '通义千问' },
            { value: 22, name: '智谱' },
            { value: 18, name: 'Deepseek' }
          ]
        }
      ]
    };
    let chart;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'skia',
        width:390,
        height:280,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, []);

  return <SkiaChart ref={skiaRef} style={styles.guageChart}/>;
}
const styles = StyleSheet.create({
    guageChart: {
        // borderWidth: 1, 
        // borderColor: 'blue', 
        // borderStyle:'solid', 
    },
});