import GuageCharter from "@/components/GuageCharter";
import NightingaleCharter from "@/components/NightingaleCharter";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image'; // 导入expo-image组件
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
// 导入 getResponse 函数，需根据实际路径调整
import { detectImage } from '@/utils/api';
import { deleteFile, deleteFileByPath, removeRecordByIndex } from "@/utils/editFile";

const printTime=(timestamp) => {
    // 创建一个 Date 对象
    const date = new Date(timestamp);
    // 获取年、月、日、小时、分钟
    const year = date.getFullYear();
    // 月份从 0 开始，所以要加 1
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // 拼接成需要的格式
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    console.log(formattedDate);
}

const ResultPageImg = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useLocalSearchParams();
    const [percentage,setPercentage]=useState(50);
    
    // const percentage0 = searchParams.percentage? parseInt(searchParams.percentage) : 40;
    const userInput = searchParams.userInput || ''; // 获取 userInput 参数
    const newflag = searchParams.newflag? parseInt(searchParams.newflag) : 0; // 获取newflag参数，默认为0
    const nowIndex = searchParams.index? parseInt(searchParams.index) : 0;
    const imgUri = searchParams.imgUri || "";
    console.log("newflag:",newflag);
    console.log("percentage",percentage);
    console.log('接收到的参数:', userInput);
    let resultText, iconName, iconStyle, cardStyle;
    if (percentage >= 0 && percentage <= 30) {
        resultText = '不太可能是AI生成';
        iconName = 'check-circle';
        iconStyle = styles.checkIcon;
        cardStyle = styles.unlikelyAi;
    } else if (percentage >= 31 && percentage <= 70) {
        resultText = '存在AI生成可能';
        iconName = 'warning';
        iconStyle = styles.warningIcon;
        cardStyle = styles.possibleAi;
    } else {
        resultText = '极大概率是AI生成';
        iconName = 'cancel';
        iconStyle = styles.crossIcon;
        cardStyle = styles.highlyLikelyAi;
    }

    useEffect(() => {
        if (newflag === 1) {
            setIsLoading(true);
            // 调用 getResponse 函数
            // getResponse(userInput)
            //   .then(response => {
            //         try {
            //             const data = JSON.parse(response);
            //             setIsLoading(false);
            //         } catch (error) {
            //             console.error('解析 JSON 出错:', error);
            //             setIsLoading(false);
            //         }
            //     })
            //   .catch(error => {
            //         console.error('获取响应出错:', error);
            //         setIsLoading(false);
            //     });
            detectImage(imgUri)
              .then(response => {
                    try {
                        const data = JSON.parse(response);
                        console.log("data",data);
                        setPercentage(data*100);
                        setIsLoading(false);
                    } catch (error) {
                        console.error('解析 JSON 出错:', error);
                        setIsLoading(false);
                    }
                })
              .catch(error => {
                    console.error('获取响应出错:', error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
        if(searchParams.percentage){
            setPercentage(parseFloat(searchParams.percentage));
        }
    }, [newflag, userInput]); // 依赖项添加 userInput

    const saveToLocal = async () => {
        try {
            const fileUri = FileSystem.documentDirectory + 'imgHistory.json';
            console.log("存储文件路径：", fileUri);
            // 读取原有文件内容
            let existingData = [];
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                const response = await FileSystem.readAsStringAsync(fileUri);
                existingData = JSON.parse(response);
            }
            // 获取当前时间戳作为时间信息
            const currentTime = new Date().getTime();
            printTime(currentTime);
            // 生成唯一的index，这里简单以现有数据长度作为index
            // const newIndex = existingData.length;
            const newIndex = currentTime;
            // 添加新数据
            const newData = { percentage, index: newIndex, time: currentTime, uri: imgUri };
            existingData.push(newData);
            // 写入更新后的数据
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(existingData));
            console.log("读取文件数据：", JSON.stringify(existingData));
            console.log('保存成功');
            Alert.alert('提示', '保存成功');
        } catch (error) {
            console.log('保存失败:', error);
        }
    };

    const deleteRecord = () => {
        removeRecordByIndex(nowIndex,'imgHistory.json');
        deleteFileByPath(imgUri);// 同时记得删除图片啊
        router.back();
    }

    return (
        <View style={styles.container}>
            {newflag === 1 && isLoading? (
                <View style={styles.overlay}>
                    <LottieView
                        source={require('@/assets/Animation.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                </View>
            ) : (
                <ScrollView>
                    <Card style={[styles.aiResultCard, cardStyle]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name={iconName} size={24} style={iconStyle} />
                            <Text style={[styles.aiResultText, { color: iconStyle.color }]}>
                                {resultText}
                            </Text>
                        </View>
                    </Card>
                    {/* 新增展示图片的Card */}
                    {imgUri && (
                        <Card style={styles.imageCard}>
                            <Card.Content>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: imgUri }}
                                        style={styles.image}
                                        contentFit="cover"
                                    />
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={[styles.guageChart]}>
                                <Text style={styles.guageTitle}>使用AIGC的概率：</Text>
                                <GuageCharter possibility={percentage}/>
                            </View>
                        </Card.Content>
                    </Card>
                    {/* <Card style={styles.card}>
                        <Card.Content>
                            <View>
                                <Text style={styles.guageTitle}>来自各模型概率：</Text>
                                <NightingaleCharter />
                            </View>
                        </Card.Content>
                    </Card> */}
                    {newflag === 1 && (
                        <TouchableOpacity style={styles.saveButton} onPress={saveToLocal}>
                            <Text style={styles.buttonText}>保存</Text>
                        </TouchableOpacity>
                    )}
                    {newflag === 0 && (
                        <TouchableOpacity style={styles.deleteButton} onPress={deleteRecord}>
                            <Text style={styles.buttonText}>删除当前记录</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.deleteButton} onPress={()=>deleteFile('imgHistory.json')}>
                        <Text style={styles.buttonText}>删除文件</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingTop: 1,
        backgroundColor: 'rgba(86, 84, 84, 0.5)',
    },
    card: {
        width: '98%',
        height: 350,
        marginBottom: 10,
    },
    // 新增图片Card的样式
    imageCard: {
        width: '98%',
        height: 300,
        marginBottom: 10,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    guageChart: {
        width: '100%',
        height: 300,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    guageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    aiResultCard: {
        width: '98%',
        height: 80,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    aiResultText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    unlikelyAi: {
        backgroundColor: '#E5FFE5',
    },
    possibleAi: {
        backgroundColor: '#FFF0CC',
    },
    highlyLikelyAi: {
        backgroundColor: '#FFE5E5',
    },
    checkIcon: {
        fontSize: 24,
        color: 'green',
        marginRight: 5,
    },
    warningIcon: {
        fontSize: 24,
        color: '#FF8C00',
        marginRight: 5,
    },
    crossIcon: {
        fontSize: 24,
        color:'red',
        marginRight: 5,
    },
    animation: {
        width: 200,
        height: 200,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#2196F3', // 蓝色调
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 10,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteButton: {
        backgroundColor: '#FF5252', // 主红色
        borderRadius: 24, // 更大圆角提升柔和感
        paddingVertical: 14, // 优化垂直内边距
        paddingHorizontal: 24, // 优化水平内边距
        marginTop: 10, // 调整上边距
        marginHorizontal: 16, // 调整水平边距
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4, // 增加阴影深度
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        overflow: 'hidden', // 确保边框圆角生效
        borderWidth: 1, // 添加细微边框
        borderColor: 'rgba(255,255,255,0.1)', // 半透明白色边框
        backgroundColor: '#FF4D4F', // 更饱和的红色
        transform: [{ scale: 1 }], // 初始状态
        transitionDuration: '200ms', // 动画过渡
        marginBottom: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16, // 增大字体
        fontWeight: '600', // 半粗体
        letterSpacing: 0.5, // 增加字间距
        textShadowColor: 'rgba(0,0,0,0.2)', // 轻微文本阴影
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});

export default ResultPageImg;