import { Stack } from 'expo-router';

import SplashScreen from '@/components/SplashScreen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hiddenFlag,setHiddenFlag]=useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
      setHiddenFlag(false);
    }, 2500); // 3秒后隐藏启动动画，可根据需要调整时间

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {false ? <SplashScreen /> : 
        <>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="history" options={{ title: '历史记录' }} />
            <Stack.Screen name="result" options={{ title: '检测结果' }} />
            <Stack.Screen name="imgResult" options={{ title: '检测结果' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </>
      }
      <StatusBar style="light" hidden={hiddenFlag}/>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});





