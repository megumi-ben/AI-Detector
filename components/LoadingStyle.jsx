import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

const App = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = () => {
        // 修改点：移除 setTimeout 代码，使加载动画持续显示
        setIsLoading(true);
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <LottieView
                    source={require('@/assets/Animation.json')}
                    autoPlay
                    loop
                    style={styles.animation}
                />
            ) : (
                <Button title="开始加载" onPress={handlePress} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: 200,
        height: 200,
    },
});

export default App;
    