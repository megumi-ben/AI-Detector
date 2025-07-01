import animationData from '@/assets/Splash2.json'; // 替换为你的JSON文件路径
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

// 获取屏幕宽度和高度
const { width, height } = Dimensions.get('window');
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {true && (<LottieView
        source={animationData}
        autoPlay
        loop
        style={styles.animation}
      />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#51385c', // 可根据需要修改背景颜色
  },
  animation: {
     width: width, // 可根据需要调整动画宽度
     height: height, // 可根据需要调整动画高度
  },
});

export default SplashScreen;  