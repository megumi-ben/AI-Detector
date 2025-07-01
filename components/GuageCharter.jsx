import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { GaugeChart } from 'echarts/charts';
import * as echarts from 'echarts/core';


echarts.use([GaugeChart,SkiaRenderer]);

export default function App({possibility}) {
  const skiaRef = useRef(null);
  useEffect(() => {
    const option = {
        series: [
        {
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: {
                color: '#FFAB91'
            },
            progress: {
                show: true,
                width: 30
            },
            pointer: {
                show: false
            },
            axisLine: {
                lineStyle: {
                width: 30
                }
            },
            axisTick: {
                distance: -45,
                splitNumber: 5,
                lineStyle: {
                width: 2,
                color: '#999'
                }
            },
            splitLine: {
                distance: -52,
                length: 14,
                lineStyle: {
                width: 3,
                color: '#999'
                }
            },
            axisLabel: {
                distance: -8,
                color: '#999',
                fontSize: 15
            },
            anchor: {
                show: false
            },
            title: {
                show: false
            },
            detail: {
                valueAnimation: true,
                width: '60%',
                lineHeight: 40,
                borderRadius: 8,
                offsetCenter: [0, '-15%'],
                fontSize: 40,
                fontWeight: 'bolder',
                formatter: '{value} %',
                color: 'inherit'
            },
            data: [
                {
                value: possibility
                }
            ]
            },
            {
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            itemStyle: {
                color: '#FD7347'
            },
            progress: {
                show: true,
                width: 8
            },
            pointer: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                show: false
            },
            detail: {
                show: false
            },
            data: [
                {
                value: possibility
                }
            ]
        }
    ]
    };
    let chart;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'skia',
        width: 360,
        height: 300,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [possibility]);

  return <SkiaChart ref={skiaRef} style={styles.guageChart}/>;
}
const styles = StyleSheet.create({
    guageChart: {
        // borderWidth: 1, 
        // borderColor: 'blue', 
        // borderStyle:'solid', 
    },
});