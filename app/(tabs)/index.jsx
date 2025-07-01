import backgroundImage from '@/assets/images/bg1.jpg';
import snowAnimation from '@/assets/snow.json';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeScreen = () => {
    const router = useRouter();

const gradients = [
  ['#0A1128', '#034078', '#0A1128', '#034078'], // 深蓝
  ['#3E1E2C', '#78244C', '#3E1E2C', '#78244C'], // 高贵暗红
  ['#1A1A2E', '#533483', '#1A1A2E', '#533483'], // 深紫
  ['#3C1518', '#D58936', '#3C1518', '#D58936']  // 深橙
];

const iconColors = ['#1E88E5', '#C2185B', '#7E57C2', '#D49B5E'];


    const buttons = [
        {
            text: '文本检测',
            icon: <MaterialIcons name="textsms" size={32} color="black" />,
            gradient: gradients[0],
            iconColor: iconColors[0],
            route: '/(tabs)/textDetect'
        },
        {
            text: '图片检测',
            icon: <FontAwesome name="image" size={32} color="black" />,
            gradient: gradients[1],
            iconColor: iconColors[1],
            route: '/(tabs)/photoDetect'
        },
        {
            text: '视频检测',
            icon: <FontAwesome name="video-camera" size={32} color="black" />,
            gradient: gradients[2],
            iconColor: iconColors[2],
            route: '/(tabs)/videoDetect'
        },
        {
            text: '历史记录',
            icon: <FontAwesome name="history" size={32} color="black" />,
            gradient: gradients[3],
            iconColor: iconColors[3],
            route: 'history'
        }
    ];

    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <LottieView
                source={snowAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
            />
            <View style={styles.container}>
                {buttons.map((btn, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.cardWrapper}
                        onPress={() => router.push(btn.route)}
                    >
                        <LinearGradient
                            colors={btn.gradient}
                            style={styles.card}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: btn.iconColor }]}> 
                                {btn.icon}
                            </View>
                            <Text style={styles.cardText}>{btn.text}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        width: '90%',
        marginVertical: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
    },
    card: {
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 24,
        marginLeft: 35,
        color: '#BDC3C7',
        fontWeight: '700',
    },
    lottieAnimation: {
        position: 'absolute',
        left: -20,
        width: '120%',
        height: '120%',
        zIndex: 0,
    },
});

export default HomeScreen;