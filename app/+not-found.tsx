import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import animationData from '@/assets/404.json';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <LottieView
          source={animationData}
          autoPlay
          loop
          style={styles.animation}
        />
        <Link href="/" style={styles.button}>
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#81806a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});