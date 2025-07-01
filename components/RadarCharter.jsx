import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';

import { RadarChart } from 'echarts/charts';
import { LegendComponent, TitleComponent } from 'echarts/components';
import * as echarts from 'echarts/core';


echarts.use([TitleComponent, LegendComponent, RadarChart, SkiaRenderer]);

export default function App({values=[100,100,100]}) {
  const skiaRef = useRef(null);
  // const values1=[
  //   [100,100,100],
  //   [200,200,200],
  //   [300,300,300],
  //   [300,300,300],
  //   [300,300,300],
  // ];
  // const values2=[
  //   [100,100,100],
  //   [200,200,200],
  //   [300,300,300],
  //   [300,300,300],
  //   [300,300,300],
  // ];
  // const values3=[
  //   [100,100,100],
  //   [200,200,200],
  //   [300,300,300],
  //   [300,300,300],
  //   [300,300,300],
  // ];
  // let values_selected=[100,200,300];

  useEffect(() => {
    console.log("values: ",values);

    // const random=Math.floor(Math.random()*5);
    // console.log("random", random);
    // if(possibility<10){
    //   values_selected=values1[random];
    // }else if(possibility<50){
    //   values_selected=values2[random];
    // }else{
    //   values_selected=values3[random];
    // }
    // console.log("values_selected: ",values_selected);

    const option = {
        // title: {
        //   text: 'Basic Radar Chart'
        // },
        legend: {
          data: ['analysis'],
          top: '0%',
          left: '65%',
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: 'likelihood', max: 500 },
            { name: 'entropy standard', max: 500 },
            { name: 'deviation ', max: 500 },
          ]
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            areaStyle: {
              opacity: 0.2 // 设置阴影面积的透明度
            },
            data: [
              {
                value: values,
                name: 'analysis'
              }
            ]
          }
        ]
      };
    let chart;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'skia',
        width: 380,
        height: 300,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, [values]);

  return <SkiaChart ref={skiaRef} style={styles.guageChart}/>;
}
const styles = StyleSheet.create({
    guageChart: {
        // borderWidth: 1, 
        // borderColor: 'blue', 
        // borderStyle:'solid', 
    },
});