import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TextDetectionPage = () => {
    const [inputText, setInputText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const fadeAnim = new Animated.Value(0);
    const inputRef = useRef(null);
    
    // 处理文本输入时的动画效果
    const handleTextChange = (text) => {
        setInputText(text);
        if (text.length > 0 && fadeAnim._value === 0) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else if (text.length === 0 && fadeAnim._value === 1) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleStartDetection = () => {
        // 这里可以添加检测逻辑
        console.log('开始检测输入的文本:', inputText);
        router.push({
            pathname: 'result',
            params: { 
                inputText: inputText,
                percentage: 60,
                newflag: 1,
             },
        });
        console.log('执行跳转后');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <ImageBackground 
                source={{ uri: 'https://picsum.photos/id/1073/800/1200' }} 
                style={styles.background}
                blurRadius={10}
            >
                <LinearGradient
                    colors={['rgba(18, 18, 18, 0.9)', 'rgba(18, 18, 18, 0.7)']}
                    style={styles.gradientOverlay}
                >
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardAvoidingView}
                        >
                            <View style={styles.contentContainer}>
                                <View style={styles.headerContainer}>
                                    <Text style={styles.appTitle}>TextDetect</Text>
                                    <Text style={styles.subtitle}>文本检测功能</Text>
                                </View>
                                
                                <View style={styles.cardContainer}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>输入文本内容</Text>
                                        <TextInput
                                            ref={inputRef}
                                            style={[
                                                styles.input, 
                                                { 
                                                    textAlignVertical: 'top',
                                                    borderColor: isFocused ? '#818CF8' : 'rgba(255, 255, 255, 0.15)',
                                                    shadowColor: isFocused ? 'rgba(129, 140, 248, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                                }
                                            ]}
                                            multiline
                                            placeholder="请输入需要检测的文本内容..."
                                            value={inputText}
                                            onChangeText={handleTextChange}
                                            placeholderTextColor="#9CA3AF"
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                        />
                                        
                                        {/* 字符计数器 */}
                                        <Animated.View style={[styles.charCountContainer, { opacity: fadeAnim }]}>
                                            <Text style={styles.charCountText}>
                                                {inputText.length} 字符
                                            </Text>
                                        </Animated.View>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            { 
                                                backgroundColor: inputText.length > 0 ? '#4F46E5' : '#6B7280',
                                                transform: [
                                                    { 
                                                        scale: inputText.length > 0 ? 1 : 0.98 
                                                    }
                                                ]
                                            }
                                        ]}
                                        onPress={handleStartDetection}
                                        disabled={inputText.length === 0}
                                    >
                                        <Text style={styles.buttonText}>开始检测</Text>
                                    </TouchableOpacity>
                                    
                                    {/* 检测功能说明 */}
                                    <View style={styles.featureCard}>
                                        <Text style={styles.featureTitle}>我们的定位</Text>
                                        <View style={styles.featureList}>
                                            <Text style={styles.featureItem}>• 更精确🎯 </Text>
                                            <Text style={styles.featureItem}>• 更快速⚡ </Text>
                                            <Text style={styles.featureItem}>• 更方便💻 </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </ScrollView>
                </LinearGradient>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scrollContainer: {
        padding: 24,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    contentContainer: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '105%',
    },
    headerContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#D1D5DB',
        opacity: 0.8,
    },
    cardContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 12,
        color: '#F9FAFB',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 220,
        maxHeight: 350,
        color: '#F9FAFB',
        fontFamily: 'System',
        lineHeight: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    charCountContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    charCountText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    button: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginVertical: 12,
        shadowColor: 'rgba(79, 70, 229, 0.3)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    featureCard: {
        marginTop: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#E5E7EB',
        marginBottom: 8,
    },
    featureList: {
        paddingLeft: 8,
    },
    featureItem: {
        fontSize: 14,
        color: '#D1D5DB',
        marginVertical: 4,
    },
});

export default TextDetectionPage;
